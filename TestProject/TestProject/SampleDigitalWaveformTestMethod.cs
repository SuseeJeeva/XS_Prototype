using System;
using System.IO;
using TestMethodNS;

namespace TestProject
{
  public class SampleDigitalWaveformTestMethod : BaseTestMethod
  {
    public override void Execute()
    {
      semiContext.GenerateDigitalWaveformPattern();
    }
  }
}
