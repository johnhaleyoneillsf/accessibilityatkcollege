function toggleContent() {
    var content = document.getElementById("content");
    var button = document.querySelector(".toggle-button");
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        button.textContent = "Read Less";
    } else {
        content.style.display = "none";
        button.textContent = "Read More";
    }
}
function toggleContent2() {
    var content = document.getElementById("content2");
    var button = document.querySelector(".toggle-button2");
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        button.textContent = "Read Less";
    } else {
        content.style.display = "none";
        button.textContent = "Read More";
    }
}
window.onload = function() {
    var savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
        adjustFontSize(savedFontSize);
        document.getElementById("slider").value = savedFontSize;
    } else {
        document.getElementById("slider").value = 2; // Default value
        adjustFontSize(2);
    }
}

window.addEventListener('storage', function(event) {
    if (event.key === "fontSize") {
        adjustFontSize(event.newValue);
        document.getElementById("slider").value = event.newValue;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('slider');
    // Add your slider initialization and functionality code here
    // Example:
    let currentIndex = 0;
    const slides = slider.getElementsByClassName('slide');
    function showSlide(index) {
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        slides[index].style.display = 'block';
    }
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }
    setInterval(nextSlide, 3000); // Change slide every 3 seconds
    showSlide(currentIndex);
});

function adjustFontSize(value) {
    const fontSizes = ["1.0rem", "1.5rem", "1.8rem", "3.0rem"];
    document.body.style.fontSize = fontSizes[value - 1];
    localStorage.setItem("fontSize", value);

    var titleText = document.querySelector(".logo-title .title-text");
    var edgerounder = document.querySelector(".language-switcher .text-contain");
    var edgerounderto = document.querySelector(".language-switcher .language-actual");
    var slider = document.querySelector(".language-switcher .slider-container .slider");

    if (value == 1) {
        titleText.textContent = "Accesibilidad en Kalamazoo College";
        edgerounder.style.borderBottomRightRadius = "0px";
        edgerounderto.style.borderBottomLeftRadius = "0px";
        slider.style.position = "relative";
        slider.style.top = "-15px"; // Adjust slider position
    }
    if (value == 2) {
        titleText.textContent = "Accesibilidad en Kalamazoo College";
        edgerounder.style.borderBottomRightRadius = "8px";
        edgerounderto.style.borderBottomLeftRadius = "8px";
        slider.style.position = "relative";
        slider.style.top = "-15px"; // Adjust slider position
    }
    if (value == 3) {
        titleText.textContent = "Accesibilidad en K College";
        edgerounder.style.borderBottomRightRadius = "15px";
        edgerounderto.style.borderBottomLeftRadius = "15px";
        slider.style.position = "relative";
        slider.style.top = "-15px"; // Adjust slider position
    }
    if (value == 4) {
        titleText.textContent = "A.K.C";
        edgerounder.style.borderBottomRightRadius = "15px";
        edgerounderto.style.borderBottomLeftRadius = "15px";
        slider.style.position = "relative";
        slider.style.top = "-30px"; // Adjust slider position
    }
}