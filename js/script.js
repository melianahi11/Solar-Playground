document.addEventListener("DOMContentLoaded", main);

function main() {
    initBalls();
    moveBalls();
    updateSunPosition(); 
    setInterval(updateSunPosition, 60000);
}

const balls = [];

function initBalls() {
    const ballContainer = document.getElementById('ball-container');
    const numberOfBalls = getRandomNumber(1, 10);
    for (let i = 1; i <= numberOfBalls; i++) {
        createBall(ballContainer);
    }
}

function createBall(container) {
    const ballContainerDiv = document.createElement('div');
    ballContainerDiv.classList.add('ball-container');
    ballContainerDiv.style.left = `${Math.random() * (window.innerWidth - 150)}px`;
    ballContainerDiv.style.top = `${Math.random() * (window.innerHeight - 150)}px`;

    const ball = document.createElement('div');
    ball.classList.add('ball');
    ball.style.backgroundColor = getRandomColor();

    const shadow = document.createElement('div');
    shadow.classList.add('shadow');

    ballContainerDiv.appendChild(ball);
    ballContainerDiv.appendChild(shadow);
    container.appendChild(ballContainerDiv);

    const velocity = {
        x: Math.random() * 4 + 1,
        y: Math.random() * 4 + 1
    };

    balls.push({ element: ballContainerDiv, velocity });

    addDragListeners(ballContainerDiv);
}

function addDragListeners(ballContainerDiv) {
    let isDragging = false;
    let offsetX, offsetY;

    ballContainerDiv.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - ballContainerDiv.getBoundingClientRect().left;
        offsetY = e.clientY - ballContainerDiv.getBoundingClientRect().top;
        ballContainerDiv.style.zIndex = '1000';
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            ballContainerDiv.style.left = `${e.clientX - offsetX}px`;
            ballContainerDiv.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            ballContainerDiv.style.zIndex = '';
        }
    });
}

function moveBalls() {
    balls.forEach((ball, index) => {
        updateBallPosition(ball);
        checkCollisions(ball, balls, index);
    });
    updateShadows();
    requestAnimationFrame(moveBalls);
}

function updateBallPosition(ball) {
    const ballRect = ball.element.getBoundingClientRect();
    let x = parseFloat(ball.element.style.left);
    let y = parseFloat(ball.element.style.top);

    if (x + ballRect.width >= window.innerWidth || x <= 0) {
        ball.velocity.x *= -1;
    }
    if (y + ballRect.height >= window.innerHeight || y <= 0) {
        ball.velocity.y *= -1;
    }

    ball.element.style.left = `${x + ball.velocity.x}px`;
    ball.element.style.top = `${y + ball.velocity.y}px`;
}

function checkCollisions(ball, balls, index) {
    const ballRect = ball.element.getBoundingClientRect();

    for (let j = index + 1; j < balls.length; j++) {
        const otherBall = balls[j];
        const otherBallRect = otherBall.element.getBoundingClientRect();
        const radius1 = ballRect.width / 2;
        const radius2 = otherBallRect.width / 2;
        const dx = (parseFloat(ball.element.style.left) + radius1) - (parseFloat(otherBall.element.style.left) + radius2);
        const dy = (parseFloat(ball.element.style.top) + radius1) - (parseFloat(otherBall.element.style.top) + radius2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius1 + radius2) {
            swapVelocities(ball, otherBall);
            separateBalls(ball, otherBall, dx, dy, radius1, radius2, distance);
        }
    }
}

function swapVelocities(ball1, ball2) {
    [ball1.velocity.x, ball2.velocity.x] = [ball2.velocity.x, ball1.velocity.x];
    [ball1.velocity.y, ball2.velocity.y] = [ball2.velocity.y, ball1.velocity.y];
}

function separateBalls(ball1, ball2, dx, dy, radius1, radius2, distance) {
    const overlap = (radius1 + radius2) - distance;
    const moveX = dx * (overlap / distance);
    const moveY = dy * (overlap / distance);

    ball1.element.style.left = `${parseFloat(ball1.element.style.left) + moveX}px`;
    ball1.element.style.top = `${parseFloat(ball1.element.style.top) + moveY}px`;
    ball2.element.style.left = `${parseFloat(ball2.element.style.left) - moveX}px`;
    ball2.element.style.top = `${parseFloat(ball2.element.style.top) - moveY}px`;
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function calculateSunPosition() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const timeDecimal = hours + minutes / 60;
    const sunrise = 6;
    const sunset = 18;

    if (timeDecimal < sunrise || timeDecimal > sunset) {
        return 0;
    }
    const sunAngle = ((timeDecimal - sunrise) / (sunset - sunrise)) * 180;
    return sunAngle;
}

function updateBackground(){
    const currentTime = new Date();
    const hours = currentTime.getHours();

    let gradient;

    if (hours >= 6 && hours < 8) {
        gradient = `linear-gradient(to top, #FFCC80, #81D4FA)`;
    } else if (hours >= 8 && hours < 17) {
        gradient = `linear-gradient(to top, #2196F3, #BBDEFB)`;
    } else if (hours >= 17 && hours < 19) {
        gradient = `linear-gradient(to top, #FF5722, #673AB7)`;
    } else {
        gradient = `linear-gradient(to top, #1A237E, #000000)`;
    }
    document.body.style.background = gradient + ` !important`;
    console.log("Background gradient set to:", gradient);
}

function updateSunPosition() {
    const sunDegrees = calculateSunPosition();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x, y;
    
    if (sunDegrees <= 90) {
        x = (sunDegrees / 90) * (viewportWidth / 2); // Move from left to center
        y = viewportHeight - (sunDegrees / 90) * viewportHeight; // Move to top
    } else {
        x = ((sunDegrees - 90) / 90) * (viewportWidth / 2) + (viewportWidth / 2); // Move from center to right
        y = 0; // At noon (top center)
    }
    
    console.log(`Sun Degrees: ${sunDegrees}, X: ${x}, Y: ${y}`);
    const sunElement = document.querySelector('.sun');
    if (sunElement) {
        sunElement.style.left = `${x}px`;
        sunElement.style.top = `${y}px`;
    }
    
    updateBackground();
    updateShadows();
}

function updateShadows() {
    const sun = document.querySelector('.sun');
    const sunRect = sun.getBoundingClientRect();
    const sunX = sunRect.left + sunRect.width / 2;
    const sunY = sunRect.top + sunRect.height / 2;

    balls.forEach(ball => {
        const ballRect = ball.element.getBoundingClientRect();
        const ballX = ballRect.left + ballRect.width / 2;
        const ballY = ballRect.top + ballRect.height / 2;
        
        const angle = Math.atan2(ballY - sunY, ballX - sunX);
        const shadow = ball.element.querySelector('.shadow');
        
        const offsetX = Math.cos(angle) * 20; // Adjust shadow distance horizontally
        
        shadow.style.transform = `translateX(${offsetX}px) translateX(-50%) translateY(10px)`; // Center and vertically align the shadow
    });
}

