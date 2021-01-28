const video = document.getElementById('video')
var total_amount = 0;
var happy_amount = 0;
var time = 1;

var Output = document.getElementById("OutputCanvas");
var OutputData = Output.getContext("2d");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

// function startVideo() {
//   navigator.getUserMedia(
//     { video: {} },
//     stream => video.srcObject = stream,
//     err => console.error(err)
//   )
// }
function startVideo(){
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Not adding `{ audio: true }` since we only want video now
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    //video.src = window.URL.createObjectURL(stream);
    video.srcObject = stream;
    video.play();
  });
}
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height}
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    if(detections.length>0){
      total_amount++;
      // console.log(detections[0].expressions.happy);}
      if (detections[0].expressions.happy > 0.6) {
        happy_amount++;
      }
      //console.log("happy rate"+happy_amount/total_amount);
    }

   

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    
    // OutputData.fillStyle = "rgba(255,255,255,0.2)";
    // OutputData.fillRect(0, 0, 720/3, 560/3);
   
    // faceapi.draw.drawFaceExpressions(Output, resizedDetections)
  }, 100)

  OutputData.fillStyle = "rgba(220,20,60)";
  OutputData.font = "15px Arial";
  OutputData.fillText("愉悦率",0,30);
  for(i=0;i<10;i++){
    OutputData.fillText("12:0"+i, (i-1)*56, 550);
  }

  setInterval(async()=>{
    if(total_amount>0){
    console.log(happy_amount + "happy expressions are detected in the " + time+" mintute. Your happy rate is " + happy_amount / total_amount*100 +"%");
      console.log(540 * (1 - happy_amount / total_amount));
  }
    else if(total_amount ==0){
      console.log("No face detected in the "+time+ " minute.")
    }
    OutputData.fillStyle = "rgba(220,20,60)";
    // OutputData.fillRect(0,0,720,560);
    // OutputData.fillStyle = "rgba(0,0,0)";
    OutputData.fillRect(56 * (time - 1), 480*(1-happy_amount/total_amount),20,20);
    OutputData.font = "12px Arial";
    OutputData.fillText(happy_amount / total_amount * 100 + "%", 56 * (time - 1), 480 * (1 - happy_amount / total_amount)+35);
    time++;
    total_amount = 0;
    happy_amount = 0;
    
    
  },6000)

  

})
