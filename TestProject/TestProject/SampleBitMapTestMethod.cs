using System;
using System.IO;
using TestMethodNS;

namespace TestProject
{
  public class SampleBitMapTestMethod : BaseTestMethod
  {
    public override void Execute()
    {
      semiContext.GenerateBitMapPattern();
    }
  }
}
