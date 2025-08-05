
function toggleMenu() {
    const menu = document.getElementById('side-menu');
    menu.classList.toggle('open');
}

const root = document.documentElement;

window.addEventListener('scroll', () => {
    const langBtn = document.querySelector('.desktop-language');
    if (!langBtn) return;

    // Define different scroll ranges for top and bottom borders
    const topStart = 59;
    const topEnd = 68;
    const bottomStart = 60;
    const bottomEnd = 75;
    const languageUptopStart = 110;
    const languageUptopEnd = 135;

    const scrollY = window.scrollY;

    // Calculate ratios for each border
    let topRatio = (scrollY - topStart) / (topEnd - topStart);
    topRatio = Math.max(0, Math.min(1, topRatio));
    let bottomRatio = (scrollY - bottomStart) / (bottomEnd - bottomStart);
    bottomRatio = Math.max(0, Math.min(1, bottomRatio));

    // Interpolate border-radius independently
    const topBase = 15;
    const bottomBase = 15;
    const topRadius = topBase * (1 - topRatio);
    const bottomRadius = bottomBase * bottomRatio;

    langBtn.style.borderTopLeftRadius = topRadius + 'px';
    langBtn.style.borderBottomLeftRadius = bottomRadius + 'px';

    // Animate right property in sync with border-radius scroll range
    // Use bottomStart (60) to bottomEnd (75) for full 0px to 100px movement
    let rightRatio = (scrollY - languageUptopStart) / (languageUptopEnd - languageUptopStart);
    rightRatio = Math.max(0, Math.min(1, rightRatio));
    const rightPx = 50 * rightRatio;
    langBtn.style.right = rightPx + 'px';
});
// Dynamically adjust .team-section min-height so footer is always below absolute/sticky content
function adjustTeamSectionHeight() {
    const section = document.querySelector('.team-section');
    if (!section) return;
    // Select all possibly out-of-flow content
    const absBoxes = [
        ...document.querySelectorAll('.team-flex, .box-top, .color-box')
    ];
    let maxBottom = 0;
    absBoxes.forEach(box => {
        const rect = box.getBoundingClientRect();
        // Get bottom relative to the document
        const bottom = rect.bottom + window.scrollY;
        if (bottom > maxBottom) maxBottom = bottom;
    });
    // Get section's top relative to document
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    // Set min-height so section's bottom is below all absolute content
    const neededHeight = maxBottom - sectionTop + 100; // 50px buffer
    section.style.minHeight = neededHeight + 'px';

    // --- Dynamically position #team-flex-2 below the first .team-flex ---
    const flex1 = document.querySelector('.team-flex:not(#team-flex-2)');
    const flex2 = document.getElementById('team-flex-2');
    if (flex1 && flex2) {
        const flex1Rect = flex1.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const gap = 505; // px gap between rows
        // Position #team-flex-2 so its top is just below the first .team-flex
        const topOffset = (flex1Rect.bottom - sectionRect.top) - gap;
        flex2.style.top = topOffset + 'px';
    }
}

window.addEventListener('DOMContentLoaded', adjustTeamSectionHeight);
window.addEventListener('resize', adjustTeamSectionHeight);

window.addEventListener('DOMContentLoaded', adjustTeamSectionHeight);
window.addEventListener('resize', adjustTeamSectionHeight);

// Sticky border radius effect for .desktop-language
window.addEventListener('DOMContentLoaded', function() {
    const langBtn = document.querySelector('.desktop-language');
    if (!langBtn) return;

    // Create a sentinel element above the button
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = (langBtn.offsetTop - 1) + 'px';
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.pointerEvents = 'none';
    langBtn.parentNode.insertBefore(sentinel, langBtn);

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.intersectionRatio === 0) {
                langBtn.classList.add('stuck');
            } else {
                langBtn.classList.remove('stuck');
            }
        },
        { threshold: [0] }
    );
    observer.observe(sentinel);
});
