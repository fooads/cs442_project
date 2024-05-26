document.addEventListener("DOMContentLoaded", async () => {
    const config = { backend: 'webgl', modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models' };
    const human = new Human.Human(config);

    await human.load(); // Load the models
    console.log("Human models loaded");

    const dataElement = document.getElementById("data");
    const distanceElement = document.getElementById("distance");
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    // Access the webcam stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
        })
        .catch((err) => console.error("Error accessing webcam: ", err));

    let rotationDataArray = [];
    let distanceDataArray = [];
    const recordDuration = 3000; // 3 seconds
    const pauseDuration = 5000; // 5 seconds

    function calculateMedian(values) {
        if (values.length === 0) return 0;
        values.sort((a, b) => a - b);
        const half = Math.floor(values.length / 2);
        if (values.length % 2)
            return values[half];
        return (values[half - 1] + values[half]) / 2.0;
    }

    async function detect() {
        if (video.readyState >= 2) { // Ensure the video is ready
            try {
                const result = await human.detect(video);
                
                if (result.face.length > 0) {
                    const rotation = result.face[0].rotation;
                    const distance = result.face[0].distance;
                    
                    // Collect rotation and distance data
                    rotationDataArray.push(rotation.angle);
                    distanceDataArray.push(distance);

                    // Update the UI
                    // dataElement.textContent = `Rotation: ${JSON.stringify(rotation)}`;
                    // distanceElement.textContent = `Distance: ${distance}`;
                }
            } catch (error) {
                console.error("Detection error:", error);
            }
        }

        requestAnimationFrame(detect);
    }

    function startRecording() {
        rotationDataArray = [];
        distanceDataArray = [];
        
        detect(); // Start detection

        setTimeout(() => {
            const medianRotation = {
                pitch: calculateMedian(rotationDataArray.map(r => r.pitch)),
                yaw: calculateMedian(rotationDataArray.map(r => r.yaw)),
                roll: calculateMedian(rotationDataArray.map(r => r.roll)),
            };
            const medianDistance = calculateMedian(distanceDataArray);

            console.log("Median Rotation Data:", medianRotation);
            console.log("Median Distance Data:", medianDistance);

            dataElement.textContent = `Median Rotation: ${JSON.stringify(medianRotation)}`;
            distanceElement.textContent = `Median Distance: ${medianDistance}`;

            // Pause for 5 seconds before starting the next recording
            setTimeout(startRecording, pauseDuration);
        }, recordDuration);
    }

    // Start the recording loop
    startRecording();
});