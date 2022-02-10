using MessengerNS;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Testmethod;

namespace SemiContextNS
{
  public class SemiContext
  {
    public static Messenger messenger;
    public List<string> sites = new List<string>();

    [DllImport("generate_sort.dll")]
    private static extern void GenerateFile(StringBuilder path, StringBuilder resultfile);

    public void Add(int x, int y)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        var value = x + y;
        messenger.Send(GetLogInfo(site, value.ToString(), testMethodName));
      });
    }

    public void SortDataUsingDLLAndSendData(string sourcePath, string destinationPath)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        var counter = 0;
        var destinationPathChunks = destinationPath.Split("\\");
        destinationPathChunks[destinationPathChunks.Length - 1] = site + "_" + destinationPathChunks[destinationPathChunks.Length - 1];

        var newDestinationPath = string.Join("\\", destinationPathChunks);
        GenerateFile(new StringBuilder(sourcePath), new StringBuilder(newDestinationPath));

        string[] lines = File.ReadAllLines(newDestinationPath);
        foreach (string line in lines)
        {
          string[] values = line.Split(',');
          foreach (string value in values)
          {

            messenger.Send(GetLogInfo(site, (++counter).ToString(), testMethodName));
          }
        }
      });
    }

    private DataLogInfo GetLogInfo(string site, string measuredValue, string testMethodName)
    {
      var datalogInfo = new DataLogInfo();
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Site", Value = site });
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Measured Value", Value = measuredValue });
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Test Method Name", Value = testMethodName });
      return datalogInfo;
    }
  }
}
