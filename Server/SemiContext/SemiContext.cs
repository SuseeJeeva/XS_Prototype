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
    public int bitMapSamples = 100;

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

    public void GenerateDigitalWaveformPattern(int cycles, int channels)
    {
      var digitalWaveformInfo = new DigitalWaveformInfo();
      var stringBuilders = GetNewStringBuilders(channels);
      var samplesLimit = 400;
      var hasData = false;

      for (int cycle = 0; cycle < cycles; cycle++)
      {
        for (int channel = 0; channel < channels; channel++)
        {
          hasData = true;
          stringBuilders[channel].Append(GetCycleData());
        }
        if ((cycle + 1) % samplesLimit == 0)
        {
          SendDigitalWaveformResponse(channels, stringBuilders, digitalWaveformInfo);
          digitalWaveformInfo = new DigitalWaveformInfo();
          stringBuilders = GetNewStringBuilders(channels);
          hasData = false;
        }
      }
      if (hasData)
      {
        SendDigitalWaveformResponse(channels, stringBuilders, digitalWaveformInfo);
      }
    }

    public void GenerateBitMapPattern()
    {
      for (var sample = 0; sample < bitMapSamples; sample++)
      {
        var rand = new Random();
        switch (rand.Next(0, 5))
        {
          case 0:
            GenerateCheckerBoardPattern();
            break;
          case 1:
            GenerateInverseCheckerBoardPattern();
            break;
          case 2:
            GenerateRandomPattern();
            break;
          case 3:
            GenerateDominantPassPattern();
            break;
          case 4:
            GenerateDominantFailPattern();
            break;
          case 5:
            GenerateHalfRowPassPattern();
            break;
          case 6:
            GenerateHalfColumnPassPattern();
            break;
        }
      }
    }

    private void SendDigitalWaveformResponse(int channels, StringBuilder[] stringBuilders, DigitalWaveformInfo digitalWaveformInfo)
    {
      StringBuilder result = new StringBuilder();
      for (int channel = 0; channel < channels; channel++)
      {
        result.Append(stringBuilders[channel].ToString());
        result.Append("\r\n");
      }
      digitalWaveformInfo.Data = result.ToString();
      messenger.Send(digitalWaveformInfo);
    }

    private StringBuilder[] GetNewStringBuilders(int channels)
    {
      var stringBuilders = new StringBuilder[channels];
      for (int channel = 0; channel < channels; channel++)
      {
        stringBuilders[channel] = new StringBuilder();
      }
      return stringBuilders;
    }

    private string GetCycleData()
    {
      StringBuilder data = new StringBuilder();
      Random rand = new Random();
      for (var i = 0; i < 2; i++)
      {
        var value = rand.Next(0, 2);
        for (var sample = 0; sample < 64; sample++)
        {
          data.Append(value);
        }
      }
      return data.ToString();
    }

    private void GenerateCheckerBoardPattern()
    {
      //Stopwatch stopwatch = Stopwatch.StartNew();
      var rowSize = 2160;
      var columnSize = 3840;

      var counter = 1;
      var initialcounter = 1;

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
      //stopwatch.Stop();
      //Console.WriteLine(stopwatch.Elapsed.TotalMilliseconds);
    }

    private void GenerateInverseCheckerBoardPattern()
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

    private void GenerateRandomPattern()
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

    private void GenerateDominantPassPattern()
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

    private void GenerateDominantFailPattern()
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

    private void GenerateHalfRowPassPattern()
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

    private void GenerateHalfColumnPassPattern()
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
