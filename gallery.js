// Image Gallery JavaScript
class ImageGallery {
    constructor() {
        this.currentImageIndex = 0;
        this.images = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialImages();
    }

    setupEventListeners() {
        // File input change event
        const imageInput = document.getElementById('imageInput');
        imageInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Modal close events
        const modal = document.getElementById('imageModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Prevent context menu on images
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    loadInitialImages() {
        const gallery = document.getElementById('gallery');
        const imageItems = gallery.querySelectorAll('.image-item img');

        this.images = Array.from(imageItems).map((img, index) => ({
            src: img.src,
            alt: img.alt || `Image ${index + 1}`,
            element: img.parentElement
        }));

        // Add click listeners to existing images
        imageItems.forEach((img, index) => {
            img.addEventListener('click', () => this.openModal(index));
        });
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        const gallery = document.getElementById('gallery');

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    this.addImageToGallery(e.target.result, file.name);
                };

                reader.readAsDataURL(file);
            }
        });

        // Clear the input
        event.target.value = '';
    }

    addImageToGallery(imageSrc, fileName) {
        const gallery = document.getElementById('gallery');

        // Create new image item
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = fileName;
        img.style.opacity = '0';

        imageItem.appendChild(img);
        gallery.appendChild(imageItem);

        // Add to images array
        const imageIndex = this.images.length;
        this.images.push({
            src: imageSrc,
            alt: fileName,
            element: imageItem
        });

        // Add click listener
        img.addEventListener('click', () => this.openModal(imageIndex));

        // Fade in animation
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.5s ease';
        }, 100);

        // Show success message
        this.showMessage('Image uploaded successfully!', 'success');
    }

    openModal(index) {
        this.currentImageIndex = index;
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');

        const imageData = this.images[index];

        modalImage.src = imageData.src;
        modalCaption.textContent = imageData.alt;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Add fade-in animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.opacity = '0';

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    nextImage(event) {
        if (event) {
            event.stopPropagation();
        }

        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateModalImage();
    }

    prevImage(event) {
        if (event) {
            event.stopPropagation();
        }

        this.currentImageIndex = this.currentImageIndex === 0
            ? this.images.length - 1
            : this.currentImageIndex - 1;
        this.updateModalImage();
    }

    updateModalImage() {
        const modalImage = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        const imageData = this.images[this.currentImageIndex];

        // Add fade effect
        modalImage.style.opacity = '0';

        setTimeout(() => {
            modalImage.src = imageData.src;
            modalCaption.textContent = imageData.alt;
            modalImage.style.opacity = '1';
        }, 150);
    }

    handleKeyboard(event) {
        const modal = document.getElementById('imageModal');
        if (modal.style.display !== 'block') return;

        switch (event.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'ArrowRight':
                this.nextImage();
                break;
            case 'ArrowLeft':
                this.prevImage();
                break;
        }
    }

    showMessage(text, type = 'info') {
        // Remove existing message if any
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(message);

        // Auto remove after 3 seconds
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 300);
        }, 3000);
    }

    // Public methods for global access
    deleteImage(index) {
        if (index < 0 || index >= this.images.length) return;

        const imageData = this.images[index];
        imageData.element.remove();
        this.images.splice(index, 1);

        // Close modal if the deleted image was being viewed
        const modal = document.getElementById('imageModal');
        if (modal.style.display === 'block' && this.currentImageIndex === index) {
            this.closeModal();
        }

        // Adjust current index if needed
        if (this.currentImageIndex >= this.images.length) {
            this.currentImageIndex = this.images.length - 1;
        }

        this.showMessage('Image deleted successfully!', 'success');
    }

    clearGallery() {
        const gallery = document.getElementById('gallery');
        const userImages = gallery.querySelectorAll('.image-item');

        // Keep only the first 6 sample images
        Array.from(userImages).slice(6).forEach(item => item.remove());
        this.images = this.images.slice(0, 6);

        this.closeModal();
        this.showMessage('Gallery cleared!', 'success');
    }
}

// Global functions for HTML onclick events
function openModal(imgElement) {
    const images = Array.from(document.querySelectorAll('.image-item img'));
    const index = images.indexOf(imgElement);
    gallery.openModal(index);
}

function closeModal() {
    gallery.closeModal();
}

function nextImage(event) {
    gallery.nextImage(event);
}

function prevImage(event) {
    gallery.prevImage(event);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize gallery when DOM is loaded
let gallery;
document.addEventListener('DOMContentLoaded', () => {
    gallery = new ImageGallery();

    // Add some extra functionality
    console.log('🖼️ Image Gallery loaded successfully!');
    console.log('📸 Upload images using the upload button');
    console.log('🔍 Click on any image to view in fullscreen');
    console.log('⌨️ Use arrow keys and ESC for navigation in fullscreen');
});

// Add drag and drop functionality
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        gallery.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        gallery.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        gallery.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        gallery.style.background = 'rgba(52, 152, 219, 0.1)';
        gallery.style.border = '2px dashed #3498db';
    }

    function unhighlight(e) {
        gallery.style.background = '';
        gallery.style.border = '';
    }

    gallery.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        const imageInput = document.getElementById('imageInput');
        imageInput.files = files;
        imageInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
});
