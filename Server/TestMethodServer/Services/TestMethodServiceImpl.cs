using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Testmethod;
using TestMethodNS;
using TestMethodServer.Enum;

namespace TestMethodServer.Services
{
	class TestMethodServiceImpl : TestMethod.TestMethodBase
	{
		public static AssemblyLoadContext loadContext = null;
		public static WeakReference weakReference = null;
		public static Assembly assembly = null;
		public static string dllLocation = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + @"\TestProjectDLL\TestProject.dll";
		public static string pdbLocation = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + @"\TestProjectDLL\TestProject.pdb";
		public static FlowNode currentFlowNode = null;
		public static bool terminateExecution = false;

		public override Task<UploadStatus> UpdateDLL(Chunk request, ServerCallContext context)
		{
			Console.WriteLine("***** Received a DLL Update request from client ****");
			Console.WriteLine();

			UnloadContext();
			Thread.Sleep(1000);
			UpdateDLL(request.DLLContent);
			UpdatePDB(request.PDBContent);

			Console.WriteLine("***** DLL is Updated ****");
			Console.WriteLine();
			Console.WriteLine();

			return Task.FromResult(new UploadStatus { Message = "DLL Loaded Successfully!!!" });
		}

		public override Task<Empty> ExecuteTestMethodForBitmapToolGraph(BitMapToolRequest request, ServerCallContext context)
		{
			Console.WriteLine("Executing Bit Map Tool Test Method ...");
			BaseTestMethod.semiContext.bitMapSamples = request.Samples;
			var canExecuteTestFlow = LoadContext();
			if (canExecuteTestFlow)
			{
				ExecuteTestFlowForBitmapTool();
			}
			Console.WriteLine("Test Method Executed Successfully...");
			return Task.FromResult(new Empty { });
		}

		public override Task<Empty> ExecuteTestMethodForDigitalWaveformGraph(DigitalWaveformRequest request, ServerCallContext context)
		{
			Console.WriteLine("Executing Digital Waveform Test Method ...");
			BaseTestMethod.semiContext.totalChannels = request.TotalChannels;
			BaseTestMethod.semiContext.totalCycles = request.TotalCycles;
			var canExecuteTestFlow = LoadContext();
			if (canExecuteTestFlow)
			{
				ExecuteTestFlowForDigitalWaveform();
			}
			Console.WriteLine("Test Method Executed Successfully...");
			return Task.FromResult(new Empty { });
		}

		public override Task<TestMethodReply> ExecuteTestMethod(TestMethodRequest request, ServerCallContext context)
		{
			terminateExecution = false;
			Console.WriteLine($"***** Received an execute request from client to execute {request.TestFlowName} *****");
			Console.WriteLine();

			Console.WriteLine($"Before Execution - All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");

			var canExecuteTestFlow = LoadContext();

			if (canExecuteTestFlow)
			{
				ExecuteTestFlow(request);
			}

			//double totalTime = 0;
			//if (canExecuteTestFlow)
			//{
			//  for (var i = 0; i < 100; i++)
			//  {
			//    Stopwatch stopwatch = Stopwatch.StartNew();
			//    ExecuteTestFlow(request);
			//    stopwatch.Stop();
			//    totalTime += stopwatch.Elapsed.TotalMilliseconds;
			//  }
			//  Console.WriteLine("Time taken for execution " + totalTime / 100 + "ms");
			//}
			Console.WriteLine("Test Method Executed Successfully...");
			Console.WriteLine($"After Execution - All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");
			Console.WriteLine();
			Console.WriteLine();

			return Task.FromResult(new TestMethodReply { Message = "Test Method Executed Successfully!!!" });
		}

		public override Task<Empty> ResumeExecution(Empty request, ServerCallContext context)
		{
			if (currentFlowNode != null)
			{
				currentFlowNode.HasBreakPoint = false;
			}
			Console.WriteLine("Releiving " + currentFlowNode.Name);
			return Task.FromResult(new Empty());
		}

		public override Task<Empty> StopExecution(Empty request, ServerCallContext context)
		{
			terminateExecution = true;
			if (currentFlowNode != null)
			{
				currentFlowNode.HasBreakPoint = false;
			}
			return Task.FromResult(new Empty());
		}

		private void ExecuteTestFlowForBitmapTool()
		{
			var testMethodType = assembly.GetType($"TestProject.SampleBitMapTestMethod");
			var myObj = (BaseTestMethod)Activator.CreateInstance(testMethodType);
			myObj.Execute();
		}

		private void ExecuteTestFlowForDigitalWaveform()
		{
			var testMethodType = assembly.GetType($"TestProject.SampleDigitalWaveformTestMethod");
			var myObj = (BaseTestMethod)Activator.CreateInstance(testMethodType);
			myObj.Execute();
		}

		private void ExecuteTestFlow(TestMethodRequest request)
		{
			foreach (var flowNode in request.FlowNodes)
			{
				if (flowNode.HasBreakPoint)
				{
					currentFlowNode = flowNode;
					PubSubServiceImpl.PublishData(new ResumeInfo()
					{
						FlowNodeIndex = request.FlowNodes.IndexOf(flowNode)
					});

					while (flowNode.HasBreakPoint)
					{
						Thread.Sleep(1000);
						Console.WriteLine("Waiting..." + flowNode.Name);
					}
					currentFlowNode = null;
				}
				if (terminateExecution)
				{
					break;
				}

				var testMethodType = assembly.GetType($"TestProject.{flowNode.Name}");
				var myObj = (BaseTestMethod)Activator.CreateInstance(testMethodType);
				myObj.Execute();
			}
		}

		private void UnloadContext()
		{
			if (loadContext != null)
			{
				Console.WriteLine("Unloading NewContext...");
				loadContext.Unload();

				ClearGlobalVariables();

				for (int i = 0; i < 10 && weakReference.IsAlive; i++)
				{
					GC.Collect();
					GC.WaitForPendingFinalizers();
				}
				weakReference = null;
				Console.WriteLine("Unloaded NewContext...");
				Console.WriteLine($"All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");
			}
		}

		private void UpdateDLL(ByteString data)
		{
			try
			{
				File.WriteAllBytes(dllLocation, data.ToByteArray());
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
			}
		}

		private void UpdatePDB(ByteString data)
		{
			try
			{
				File.WriteAllBytes(pdbLocation, data.ToByteArray());
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
			}
		}

		private void ClearGlobalVariables()
		{
			loadContext = null;
			assembly = null;
		}

		private bool LoadContext()
		{
			if (loadContext == null)
			{
				if (File.Exists(dllLocation))
				{
					loadContext = new AssemblyLoadContext("NewContext", true);
					weakReference = new WeakReference(loadContext, true);
					assembly = loadContext.LoadFromAssemblyPath(dllLocation);
				}
				else
				{
					Console.WriteLine("DLL does not exist. Please rebuild the project");
					return false;
				}
			}
			return true;
		}
	}
}
