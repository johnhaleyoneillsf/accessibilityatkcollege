function toggleMenu() {
    const menu = document.getElementById('side-menu');
    menu.classList.toggle('open');
}

const root = document.documentElement;

  // Function to format and display the date
  function displayLastModifiedDate() {
    // Check if the property is supported
    if (document.lastModified) {
      // Create a new Date object from the lastModified string
      const lastModifDate = new Date(document.lastModified);
      // Format the date (e.g., using toLocaleDateString for user's locale)
      const formattedDate = lastModifDate.toLocaleDateString(); 
      // Insert the formatted date into the span element
      document.getElementById('last-updated').textContent = formattedDate;
    } else {
      document.getElementById('last-updated').textContent = 'Date not available';
    }
  }

  // Call the function when the page loads
  window.onload = displayLastModifiedDate;

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
    langBtn.style.borderBottomRightRadius = bottomRadius + 'px';

    // Animate right property in sync with border-radius scroll range
    // Use bottomStart (60) to bottomEnd (75) for full 0px to 100px movement
    let rightRatio = (scrollY - languageUptopStart) / (languageUptopEnd - languageUptopStart);
    rightRatio = Math.max(0, Math.min(1, rightRatio));
    const rightPx = 63 * rightRatio;
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

document.addEventListener('DOMContentLoaded', function() {
    adjustTeamSectionHeight();
    initMemberCardPopups();
});
window.addEventListener('resize', adjustTeamSectionHeight);

// Member card click-to-link functionality
function initMemberCardPopups() {
    const memberCards = document.querySelectorAll('.member-card');
    
    // Member card data with site URLs
    const cardData = {
        'DREAM at Kalamazoo College': {
            title: 'DREAM at Kalamazoo College',
            url: 'https://linktr.ee/kcdream?fbclid=PAZXh0bgNhZW0CMTEAAaYMLZ7EH2D1ID9KnM5gyxjGQp5M4MIoRg2kP9uPX5zqBYkugQNoSRykeek_aem_OlMjCXTJVmyC1jdVBV0NgA'
        },
        'AHEAD': {
            title: 'AHEAD',
            url: 'https://www.ahead.org/'
        },
        'Kalamazoo College Accessibility Portal': { 
            title: 'Kalamazoo College Accessibility Portal',
            url: 'https://access.kzoo.edu/resources/'
        },
        'Kalamazoo College Learning Commons': {
            title: 'Kalamazoo College Learning Commons',
            url: 'https://learningcommons.kzoo.edu'
        },
        'Kalamazoo College Request for Accomadations': {
            title: 'Kalamazoo College Accessibility Portal',
            url: 'https://disabilities.kzoo.edu/request-for-accomodations/'
        },
        'Kalamazoo College Accessibility Portal': {
            title: 'Kalamazoo College Accessibility Portal',
            url: 'https://access.kzoo.edu/resources/'
        },
        
    };

    // Add click handlers to member cards that open the target URL directly
    memberCards.forEach(card => {
        card.addEventListener('click', function(event) {
            const cardTitle = card.querySelector('h3');
            if (cardTitle) {
                const titleText = cardTitle.textContent.trim();
                const data = cardData[titleText];
                
                if (data && data.url && data.url !== '#') {
                    window.open(data.url, '_blank', 'noopener');
                }
            }
        });
    });
}

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

document.addEventListener("DOMContentLoaded", () => {
    const adjustSectionHeight = () => {
        const section = document.querySelector(".interviews-section");
        if (!section) return;

        // Calculate the height of all child elements
        let maxBottom = 0;
        const children = section.querySelectorAll(".interview-box");
        children.forEach((child) => {
            const rect = child.getBoundingClientRect();
            const bottom = rect.bottom + window.scrollY;
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        });

        // Adjust the height of the section to fit all children
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const neededHeight = maxBottom - sectionTop + 50; // Add 50px buffer
        section.style.minHeight = `${neededHeight}px`;
    };

    // Adjust height on load and resize
    adjustSectionHeight();
    window.addEventListener("resize", adjustSectionHeight);
});
