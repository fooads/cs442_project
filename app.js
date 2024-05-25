document.addEventListener("DOMContentLoaded", async () => {
    const config = { backend: 'webgl', modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models' };
    const human = new Human.Human(config);

    await human.load(); // Load the models
    console.log("Human models loaded");

    const dataElement = document.getElementById("data")
    const distanceElement = document.getElementById("distance")
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Access the webcam stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
        })
        .catch((err) => console.error("Error accessing webcam: ", err));

    async function detect() {
        if (video.readyState >= 2) { // Ensure the video is ready
            try {
                const result = await human.detect(video);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const rotationData = JSON.stringify(result.face[0].rotation.angle);
                const distanceData = JSON.stringify(result.face[0].distance);
                console.log(result);
                dataElement.textContent = rotationData;
                distanceElement.textContent = distanceData;
                if (result.face.length > 0) {
                    human.draw.face(canvas, result.face);
                    const rotation = result.face[0].rotation;
                    const rotationArray = [rotation.pitch, rotation.yaw, rotation.roll];
                    console.log("Rotation array:", rotationArray); // Log the rotation array
                }
            } catch (error) {
                console.error("Detection error:", error);
            }
        }

        requestAnimationFrame(detect);
    }

    detect();
});
