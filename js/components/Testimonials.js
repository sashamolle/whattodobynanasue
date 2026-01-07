// Testimonials Web Component
class TestimonialsSection extends HTMLElement {
    constructor() {
        super();
        this.reviews = [];
    }

    connectedCallback() {
        this.render();
        this.fetchReviews();
    }

    render() {
        this.innerHTML = `
            <section class="py-20 bg-gradient-to-b from-white to-gray-50">
                <div class="container mx-auto px-6">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-gray-900 mb-4">What Parents Are Saying</h2>
                        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                            Real experiences from families who've worked with Nana Sue
                        </p>
                    </div>

                    <!-- Loading State -->
                    <div id="reviews-loading" class="text-center py-12">
                        <i class="fas fa-spinner fa-spin text-4xl text-[var(--sage-green)] mb-4"></i>
                        <p class="text-gray-500">Loading testimonials...</p>
                    </div>

                    <!-- Reviews Grid -->
                    <div id="reviews-grid" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Reviews will be injected here -->
                    </div>

                    <!-- Empty State -->
                    <div id="reviews-empty" class="hidden text-center py-12">
                        <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
                        <a href="review.html" class="inline-block mt-6 bg-[var(--sage-green)] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                            Write a Review
                        </a>
                    </div>

                    <!-- Call to Action -->
                    <div class="text-center mt-12">
                        <a href="review.html" class="inline-flex items-center gap-2 text-[var(--sage-green)] font-semibold hover:underline">
                            Share Your Experience <i class="fas fa-arrow-right text-sm"></i>
                        </a>
                    </div>
                </div>
            </section>
        `;
    }

    async fetchReviews() {
        const loadingEl = this.querySelector('#reviews-loading');
        const gridEl = this.querySelector('#reviews-grid');
        const emptyEl = this.querySelector('#reviews-empty');

        try {
            const API_BASE = window.ENV?.API_BASE || '';
            const response = await fetch(`${API_BASE}/api/reviews/approved`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.reviews = data.reviews || [];

            loadingEl.classList.add('hidden');

            if (this.reviews.length === 0) {
                emptyEl.classList.remove('hidden');
            } else {
                gridEl.classList.remove('hidden');
                this.renderReviews();
            }

        } catch (error) {
            console.error('[Testimonials] Error fetching reviews:', error);
            loadingEl.classList.add('hidden');

            // Fallback to static testimonials if API fails
            this.renderFallbackTestimonials();
            gridEl.classList.remove('hidden');
        }
    }

    renderReviews() {
        const gridEl = this.querySelector('#reviews-grid');

        gridEl.innerHTML = this.reviews.map(review => `
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <!-- Rating Stars -->
                <div class="flex gap-1 mb-4">
                    ${this.renderStars(review.rating)}
                </div>
                
                <!-- Comment -->
                <p class="text-gray-700 leading-relaxed mb-6 italic">
                    "${review.comment}"
                </p>
                
                <!-- Student Info -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p class="font-semibold text-gray-900">${this.escapeHtml(review.studentName)}</p>
                        <p class="text-sm text-gray-500">${review.classType} Class</p>
                    </div>
                    <i class="fas fa-quote-right text-3xl text-[var(--sage-green-light)]"></i>
                </div>
            </div>
        `).join('');
    }

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-yellow-400"></i>';
            } else {
                stars += '<i class="far fa-star text-gray-300"></i>';
            }
        }
        return stars;
    }

    renderFallbackTestimonials() {
        const gridEl = this.querySelector('#reviews-grid');

        // Static fallback testimonials (from existing index.html)
        const fallbackReviews = [
            {
                rating: 5,
                comment: "Nana Sue's expertise is unmatched. She helped us understand our baby's development in ways we never imagined.",
                studentName: "Sarah M.",
                classType: "Mobility"
            },
            {
                rating: 5,
                comment: "The personalized attention and practical techniques have made such a difference in our baby's progress.",
                studentName: "Michael & Lisa",
                classType: "Consultation"
            },
            {
                rating: 5,
                comment: "We're so grateful for Nana Sue's guidance. Our little one is thriving!",
                studentName: "Jennifer K.",
                classType: "Virtual"
            }
        ];

        gridEl.innerHTML = fallbackReviews.map(review => `
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div class="flex gap-1 mb-4">
                    ${this.renderStars(review.rating)}
                </div>
                <p class="text-gray-700 leading-relaxed mb-6 italic">
                    "${review.comment}"
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p class="font-semibold text-gray-900">${review.studentName}</p>
                        <p class="text-sm text-gray-500">${review.classType} Class</p>
                    </div>
                    <i class="fas fa-quote-right text-3xl text-[var(--sage-green-light)]"></i>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('testimonials-section', TestimonialsSection);
