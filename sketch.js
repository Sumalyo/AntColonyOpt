let indices = [];
let bestTourindices = [];
let tourHistory = [];
let bestTourDist = Infinity;
let points = [];
let distanceCache = [];
let pheromoneTrailsGlobal = [];
let pheromoneTrailsGlobalCopy = [];
//let pheromax = 0;

class ant
{
  constructor(p,headStart=false)
  {
    this.pathLog = [];
    this.tourHistory = [];
    this.phermoneMap=[];
    let filler = [];
    for (let i = 0; i<indices.length;i++)
    {
      filler.push(0);
    }
    for (let i = 0; i<indices.length;i++)
    {
      this.pathLog.push(0);
      this.phermoneMap.push(filler);
    }
    this.p = p; // positional index
    if (headStart)
    {
      this.pathLog[p]=1;
      this.tourHistory.push(p);
    }
    this.moves = 0;
    this.done=0; // records if all towns are visited
  }
  //it needs to pick a new town to travel to that it has not visited yet
  moveNew()
  {
    this.done = 1;
    for (let i = 0; i<this.pathLog.length;i++)
    {
      if(this.pathLog[i]==0)
      {
      this.done=0;
      break;
      }
    }
    if (this.done==1 || this.moves>10000)
    {
      return 1;
    }
    let e = 3; // desirablity power
    let ph = 1.8; // pheromone power
    if (this.done==0)
    {
      let desirebility = -1;
      let desiredIndex = -1;
      for (let i = 0; i<indices.length;i++)
      {
        //let dst = distanceCache[p,i]; // corner case not handlled that two cities lie on same coordinate
        if (i==this.p)
        {
          continue;
        }
        else{
            let dst = distanceCache[i][this.p];
            let pheromoneStrength = pheromoneTrailsGlobal[i][this.p];
            let des = pow(1/dst,e)*pow(pheromoneStrength,ph);
            if (des > desirebility && this.pathLog[i]!=1)
            {
              desirebility = des;
              desiredIndex = i;
            }
        }
      }
      // console.log("moved from")
      // console.log(this.p);
      // console.log("moved to");
      // console.log(desiredIndex);
      this.phermoneMap[this.p][desiredIndex]+=0.4; // TODO Fix the scoring system
      pheromoneTrailsGlobal[this.p][desiredIndex]+=0.2;
      

      this.p=desiredIndex;
      this.tourHistory.push(desiredIndex);
      this.pathLog[desiredIndex]=1;
      this.moves++;

      //this.done=1;
    }
    return 0;
  }
  scorePath()
  {
    let d = 0;
    let scalingfactor = 1;
    let penalty = 0.8;
    for (let i = 0; i<this.tourHistory.length-1 ;i++)
    {
      d+=distanceCache[this.tourHistory[i]][this.tourHistory[i+1]];
    }
    //console.log(d)
    if (d<=bestTourDist)
    {
      bestTourDist=d;
      scalingfactor = 1.2;
    }
    else
    {
      scalingfactor = (bestTourDist/d)*penalty;
    }
      for (let i  = 0; i < indices.length ; i++)
    {
      for (let j  = 0; j < indices.length ; j++)
      {
        this.phermoneMap[i][j]=scalingfactor*this.phermoneMap[i][j];
      }
    }
    //console.log(scalingfactor);

  }


}
function fillDistanceCache()
{
  for (let i = 0; i< points.length ; i++)
  {
    distanceCache.push([])
    pheromoneTrailsGlobal.push([]) 
    for (let j = 0; j<points.length; j++)
    {
        distanceCache[i].push(dist(points[i].x,points[i].y,points[j].x,points[j].y));
        pheromoneTrailsGlobal[i].push(0);
    }
  }
}

function blockingSleep(wT,t1)
{
    // t1 the millis() that instant
    // the wait time wanted in seconds
    while(true)
    {
    let t2 = millis();
    if (t2 > t1+wT*100)
    {
      //console.log(t2);
      //console.log(t1+wT*100);
      break;
    }
    continue;
    }
    return;
}
function LookUpDist(p,q)
{
// let a = createVector(0,0);
// let b = createVector(0,0);
//return p.sub(q).mag()
return dist(p.x,q.x,q.x,q.y);
}
function GenerateSolutions(indices,n)
{
  if (n==1)
  {
    EvaluateSolution(indices);
  }
  else
  {
    for(let i = 0;i < n; i+=1)
    {
      GenerateSolutions(indices,n-1);
      let swapindex = (n % 2 === 0)? i : 0;
      [indices[swapindex],indices[n-1]]=[indices[n-1],indices[swapindex]];
      // let x = indices[swapindex];
      // indices[swapindex] = indices[n-1];
      // indices[n-1] = x;
    }
  }
}
function EvaluateSolution(indices_passed)
{
  
   //if (indices[0] < indices[indices.length-2]) return;
  // {
    //indices.push(0) // assign it to come back HEAD START PROBLEM
    indices_passed.push(indices_passed[0]) //assign it to come back
    //console.log(indices_passed);
    let tourDist = 0;
    for(let i = 0;i<indices_passed.length;i+=1)
    {
      let nextindex = (i + 1)%indices_passed.length;
      tourDist+=LookUpDist(points[indices_passed[i]],points[indices_passed[nextindex]]);
    }
    //console.log(tourDist);
    if (tourDist < bestTourDist)
    {
      bestTourDist = tourDist;
      bestTourindices = indices_passed.slice();
      tourHistory.push(bestTourindices);
    }
    indices_passed.pop(); // take out the final point
  // }
}
function Solve()
{
GenerateSolutions(indices,indices.length-1); // Generate solutions using HEAPS Algorithm
}
function drawPoints(x)
{
  //console.log(x);
  for(let i = 0;i<x.length;i+=1)
  {
    push();
    stroke(color("blue"));
    fill(color("blue"));
    circle(points[x[i]].x,points[x[i]].y,4);
    pop();
  }
}
function drawPath(x,c="black")
{
  //console.log(x);
  push();
  stroke(color(c));
  fill(color(c));
  let i;
  for(i = 0;i<x.length-1;i=i+1)
    {
      line(points[x[i]].x,points[x[i]].y,points[x[i+1]].x,points[x[i+1]].y);
      blockingSleep(2,millis());
    }
    // draw last bit
    line(points[x[i]].x,points[x[i]].y,points[x[0]].x,points[x[0]].y);
  pop();
}
function drawPathIter(arr,x,c="black")
{
  //console.log(x);
  if(x>=arr.length-1)
  {
    x=arr.length-1;
  }

  push();
  stroke(color(c));
  fill(color(c));
  let i;
  for(i = 0;i<=x ;i=i+1)
    {
      //a=x%points.length;
      b=(i+1)%arr.length;
      line(points[arr[i]].x,points[arr[i]].y,points[arr[b]].x,points[arr[b]].y);
    }
  pop();
}


let glen = 30;
function setup() {
  createCanvas(730, 600);
  for(let i = 0;i<glen;i+=1)
  {
    points.push(createVector(random(0,width),random(0,height)));
    indices.push(i);
  }
  bestTourindices = indices.slice();
  bestTourDist = Infinity;
  fillDistanceCache();
  //console.log(distanceCache);

}
//sets up a level playing field for all the methods 






let iT = 0;
let hist = 0;
c = "red";
done = 0;

function oneShotRecursiveSolve()
{
  if (done==0)
  {
    Solve(); // one shot solution which is quite computationally intensive
    //console.log(bestTourDist);// why don't we use an iterative approach
    done=0.5;
  }
  if(done==0 || done == 0.5)
    background(220);
    
    drawPoints(indices);
    drawPathIter(tourHistory[hist],iT,c);
    blockingSleep(1,millis());
  
    if(iT<tourHistory[hist].length)
    {
      iT++;
    }
    else
    {
      iT=0;
      if (hist < tourHistory.length-1)
      {
        hist++;
      }
      else
      {
        c="green";
        done=1;
      }
  
    }  
}

let numAnts = 6;
function antGen()
{
  //pheromoneTrailGlobalCopy = pheromoneTrailsGlobal.splice();
  let ants = [];
  for (let i =0; i<numAnts;i++)
  {
    let startIndex = (int)(random(0,indices.length));
    ants.push(new ant(startIndex));
    //console.log(startIndex);
    let val  = 0;
  while (val==0)
  {
    val = ants[i].moveNew();
  }
  ants[i].scorePath();
  //console.log(ants[i].tourHistory);
  tourHistory.push(ants[i].tourHistory);
  }
  //update global pheromone trails
  //let pMap;
  for (let i = 0; i<ants.length;i++)
  {
    let pMapA = ants[i].phermoneMap;
    for (let i  = 0; i < indices.length ; i++)
    {
      for (let j  = 0; j < indices.length ; j++)
      {
        pheromoneTrailsGlobal[i][j]+=(pMapA[i][j]/numAnts); // TODO FIXME scoring way update global trails
      }
    }
  }
  pheromoneTrailsGlobalCopy = pheromoneTrailsGlobal.slice();
  //console.log(pheromoneTrailsGlobal);
}
function drawPheromoneTrails(NothaltClipping)
{

  let pheromax=0;
  for (let i  = 0; i < indices.length ; i++)
    {
      for (let j  = 0; j < indices.length ; j++)
      {
        if (pheromoneTrailsGlobalCopy[i][j] > pheromax)
        {
          pheromax = pheromoneTrailsGlobalCopy[i][j];;
        }
      }
    }
    //console.log(NothaltClipping);
    console.log(pheromax);
      for (let i  = 0; i < indices.length ; i++)
    {
      for (let j  = 0; j < indices.length ; j++)
      {
        let impact = pheromoneTrailsGlobalCopy[i][j];
        //if (impact > pheromax){pheromax=impact;}
        if (pheromoneTrailsGlobalCopy[i][j]-5>=0 && NothaltClipping > 0)
        {
          pheromoneTrailsGlobalCopy[i][j]-=10;
        }
        //console.log(impact)
        let mappedValue = map(impact, 0, pheromax, 0, 100, true); 
        push();
        stroke(0,0,0,mappedValue);
        line(points[i].x,points[i].y,points[j].x,points[j].y);
        pop();
      }
    }
    //pheromax=0;
}


let haltClipping = 100; // MAX GENERATION X 2 or MAX ANTS
function DrawAntsSolve(iterations)
{
  if (done==0)
  {
    // for(let i = 0; i<iterations;i++)
    // {
    // antGen();
    // }
    // Iterative solving done right
    if (generationsGlobal>0)
    {
      antGen();
      generationsGlobal--;
      
      //console.log("called")
      //drawPheromoneTrails();
    }
    //Solve(); // one shot solution which is quite computationally intensive
    //console.log(bestTourDist);// why don't we use an iterative approach
    if (generationsGlobal==0)
      {
        done=0.5;
        //haltClipping-=1;
      }
    //console.log("solved")
  }

  if(done==0 || done == 0.5)
    {
    background(220);
    }
    
    drawPoints(indices);
    
    if (done==0.5)
    {drawPheromoneTrails(haltClipping);}
    haltClipping--;
    drawPathIter(tourHistory[hist],iT,c);
    blockingSleep(1,millis());
    
    // We want to visualize global pheromone trails
    //console.log(hist);


  
    if(iT<tourHistory[hist].length)
    {
      iT++;
    }
    else
    {
      iT=0;
      if (hist < tourHistory.length-1)
      {
        hist++;
      }
      else
      {
        c="green";
        done=1;
      }
  
    } 
  //console.log(iT);
  //console.log(hist); 
}



let generationsGlobal = 8;
function draw() {
  //oneShotRecursiveSolve();
  
  DrawAntsSolve(generationsGlobal);
  //console.log(pheromax);
  //console.log(pheromoneTrails);


}
