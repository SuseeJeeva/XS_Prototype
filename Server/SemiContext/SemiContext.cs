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
    public Dictionary<string, char> signatureMapping = new Dictionary<string, char>();

    public SemiContext()
    {
      for (var i = 0; i < 256; i++)
      {
        signatureMapping.Add(Convert.ToString(i, 2).PadLeft(8, '0'), (char)i);
      }
    }

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
            messenger.Send(GetLogInfo(site, value, testMethodName));
          }
        }
      });
    }

    public void IterateOverAllSites(double iterationCount)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        for (double i = 0; i < iterationCount; i++)
        {
          messenger.Send(GetLogInfo(site, i.ToString(), testMethodName));
        }
      });
    }

    public void GenerateCheckerBoardPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      var counter = 1;
      var initialcounter = 1;

      StringBuilder characterBuilder = new StringBuilder();


      StringBuilder returnValue = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        counter = initialcounter;
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          characterBuilder.Append(counter);
          if (characterBuilder.Length == 8)
          {
            returnValue.Append(signatureMapping[characterBuilder.ToString()]);
            characterBuilder = new StringBuilder();
          }
          //if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          //{
          //  stringBuilder.Append("\r\n");
          //}
          //else if (columnNumber != columnSize - 1)
          //{
          //  returnValue.Append(",");
          //}
          counter = (counter + 1) % 2;
        }
        initialcounter = (initialcounter + 1) % 2;
      }
      bitmapInfo.Data = returnValue.ToString();
      messenger.Send(bitmapInfo);
    }

    public void GenerateInverseCheckerBoardPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      var counter = 0;
      var initialcounter = 0;

      StringBuilder stringBuilder = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        counter = initialcounter;
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          stringBuilder.Append(counter);
          if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          {
            stringBuilder.Append("\r\n");
          }
          else if (columnNumber != columnSize - 1)
          {
            stringBuilder.Append(",");
          }
          counter = (counter + 1) % 2;
        }
        initialcounter = (initialcounter + 1) % 2;
      }
      bitmapInfo.Data = stringBuilder.ToString();
      messenger.Send(bitmapInfo);
    }

  public void GenerateRandomPattern()
  {
    var rowSize = 2160;
    var columnSize = 3840;
    var rand = new Random();

    StringBuilder stringBuilder = new StringBuilder();
    var bitmapInfo = new BitMapInfo();
    for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
    {
      for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
      {
        stringBuilder.Append(rand.Next(0, 2));
        if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
        {
          stringBuilder.Append("\r\n");
        }
        else if (columnNumber != columnSize - 1)
        {
          stringBuilder.Append(",");
        }
      }
    }
    bitmapInfo.Data = stringBuilder.ToString();
    messenger.Send(bitmapInfo);
  }

    public void GenerateDominantPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var rand = new Random();

      StringBuilder stringBuilder = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          var randomValue = rand.Next(0, 10);
          stringBuilder.Append(randomValue > 7 ? 1 : 0);
          if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          {
            stringBuilder.Append("\r\n");
          }
          else if (columnNumber != columnSize - 1)
          {
            stringBuilder.Append(",");
          }
        }
      }
      bitmapInfo.Data = stringBuilder.ToString();
      messenger.Send(bitmapInfo);
    }

    public void GenerateDominantFailPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var rand = new Random();

      StringBuilder stringBuilder = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          var randomValue = rand.Next(0, 10);
          stringBuilder.Append(randomValue > 7 ? 0 : 1);
          if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          {
            stringBuilder.Append("\r\n");
          }
          else if (columnNumber != columnSize - 1)
          {
            stringBuilder.Append(",");
          }
        }
      }
      bitmapInfo.Data = stringBuilder.ToString();
      messenger.Send(bitmapInfo);
    }

    public void GenerateHalfRowPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      StringBuilder stringBuilder = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          stringBuilder.Append(rowNumber <= (rowSize / 2) ? 1 : 0);
          if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          {
            stringBuilder.Append("\r\n");
          }
          else if (columnNumber != columnSize - 1)
          {
            stringBuilder.Append(",");
          }
        }
      }
      bitmapInfo.Data = stringBuilder.ToString();
      messenger.Send(bitmapInfo);
    }

    public void GenerateHalfColumnPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      StringBuilder stringBuilder = new StringBuilder();
      var bitmapInfo = new BitMapInfo();
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          stringBuilder.Append(rowNumber <= (columnSize / 2) ? 1 : 0);
          if (rowNumber != rowSize - 1 && columnNumber == columnSize - 1)
          {
            stringBuilder.Append("\r\n");
          }
          else if (columnNumber != columnSize - 1)
          {
            stringBuilder.Append(",");
          }
        }
      }
      bitmapInfo.Data = stringBuilder.ToString();
      messenger.Send(bitmapInfo);
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
