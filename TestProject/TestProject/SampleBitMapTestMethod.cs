using System;
using System.IO;
using TestMethodNS;

namespace TestProject
{
  public class SampleBitMapTestMethod : BaseTestMethod
  {
    public override void Execute()
    {
      var rand = new Random();
      for (var i = 0; i < 1000; i++)
      {
        //switch (rand.Next(0, 5))
        switch (0)
        {
          case 0:
            semiContext.GenerateCheckerBoardPattern();
            break;
          case 1:
            semiContext.GenerateInverseCheckerBoardPattern();
            break;
          case 2:
            semiContext.GenerateRandomPattern();
            break;
          case 3:
            semiContext.GenerateDominantPassPattern();
            break;
          case 4:
            semiContext.GenerateDominantFailPattern();
            break;
          case 5:
            semiContext.GenerateHalfRowPassPattern();
            break;
          case 6:
            semiContext.GenerateHalfColumnPassPattern();
            break;
        }
      }
    }
  }
}
