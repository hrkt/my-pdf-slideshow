/**
 * webcam handling functions
 *
 * (C) 2022 Hiroki Ito
 */

// variables
let streaming = false // true for streaming now, otherwise false
let videoStream = null // video stream opened in this app

const webcamWidth = 200 // tiny area
let webcamHeight = 150 // scales later depending on its device
const frameRate = 1 // be humble to narrow network bandwidth.

let webcamClickListener = null // listener to handle clicking on video to dismiss it

/**
 * initialize webcam and start streaming
 */
export function enableWebcam () {
  const video = document.getElementById('webcam-output')

  const constraintsWithFrameRate = { video: { frameRate: { max: frameRate } }, audio: false }
  const constraints = { video: true, audio: false }

  navigator.mediaDevices.getUserMedia(constraintsWithFrameRate)
    .then(function (stream) {
      // currently on Chrome
      videoStream = stream
      video.srcObject = stream
      video.play()
    })
    .catch(function (err) {
      console.log('could not appply constraints. Try without-constraints pattern.' + err)
      // then we do not specify video constraints.
      // currently on Firefox

      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
          videoStream = stream
          video.srcObject = stream
          video.play()
        })
        .catch(function (err) {
          console.log('An error occurred: ' + err)
          alert('sorry, could not get video stream.')
        })
    })

  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      webcamHeight = video.videoHeight / (video.videoWidth / webcamWidth)

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

      if (isNaN(webcamHeight)) {
        webcamHeight = webcamWidth / (4 / 3)
      }

      video.setAttribute('width', webcamWidth)
      video.setAttribute('height', webcamHeight)
      streaming = true
      video.style.visibility = 'visible'

      webcamClickListener = video.addEventListener('click', () => {
        disableWebcam()
      })
    }
  }, false)
}

/**
 * stop streaming and dismiss video area
 */
export function disableWebcam () {
  if (!streaming) {
    return
  }
  streaming = false
  videoStream.getVideoTracks().forEach(track => track.stop())
  const video = document.getElementById('webcam-output')
  video.style.visibility = 'hidden'

  video.removeEventListener(webcamClickListener)
}
