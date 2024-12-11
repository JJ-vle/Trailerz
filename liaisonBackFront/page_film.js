document.querySelectorAll('.carousel').forEach((carousel) => {
    const prevButton = carousel.closest('.carousel-container').querySelector('.prev');
    const nextButton = carousel.closest('.carousel-container').querySelector('.next');

    let offset = 0;
    const movieWidth = carousel.children[0].offsetWidth + 10;
    const visibleMovies = 3;
    const maxOffset = -(movieWidth * (carousel.children.length - visibleMovies));

    prevButton.addEventListener('click', () => {
        if (offset === 0) {
            offset = maxOffset;
        } else {
            offset = Math.min(offset + movieWidth, 0);
        }
        carousel.style.transform = `translateX(${offset}px)`;
    });

    nextButton.addEventListener('click', () => {
        if (offset <= maxOffset) {
            offset = 0;
        } else {
            offset = Math.max(offset - movieWidth, maxOffset);
        }
        carousel.style.transform = `translateX(${offset}px)`;
    });
});