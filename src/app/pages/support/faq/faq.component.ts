import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="faq-container">
      <h1>Frequently Asked Questions</h1>
      
      <div class="search-section">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="filterFAQs()"
          placeholder="Search FAQs..."
          class="search-input"
        >
      </div>

      <div class="categories">
        <button
          *ngFor="let category of categories"
          [class.active]="selectedCategory === category"
          (click)="selectCategory(category)"
          class="category-btn"
        >
          {{ category }}
        </button>
      </div>

      <div class="faq-list">
        <div
          *ngFor="let faq of filteredFAQs"
          class="faq-item"
          [class.expanded]="expandedItems.has(faq.question)"
          (click)="toggleItem(faq.question)"
        >
          <div class="question">
            <h3>{{ faq.question }}</h3>
            <span class="icon">{{ expandedItems.has(faq.question) ? '−' : '+' }}</span>
          </div>
          <div class="answer" *ngIf="expandedItems.has(faq.question)">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>

      <div class="contact-section" *ngIf="filteredFAQs.length === 0">
        <p>No FAQs found matching your search.</p>
        <p>Still have questions? <a routerLink="/support/contact">Contact us</a> for assistance.</p>
      </div>
    </div>
  `,
  styles: [`
    .faq-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .search-section {
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .categories {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #4CAF50;
      border-radius: 20px;
      background: none;
      color: #4CAF50;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-btn:hover,
    .category-btn.active {
      background: #4CAF50;
      color: white;
    }

    .faq-item {
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .question {
      padding: 1rem;
      background: #f8f9fa;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .question h3 {
      margin: 0;
      color: #333;
    }

    .icon {
      color: #4CAF50;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .answer {
      padding: 1rem;
      background: white;
    }

    .answer p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .contact-section {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .contact-section p {
      color: #666;
      margin-bottom: 1rem;
    }

    a {
      color: #4CAF50;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class FAQComponent {
  searchQuery: string = '';
  selectedCategory: string = 'All';
  expandedItems: Set<string> = new Set();
  categories: string[] = ['All', 'Booking', 'Payment', 'Hosting', 'Account', 'Safety'];

  faqs: FAQItem[] = [
    {
      category: 'Booking',
      question: 'How do I book a dinner?',
      answer: 'To book a dinner, browse through available dinners, select your preferred date and time, and click the "Book Now" button. You\'ll need to create an account if you haven\'t already.'
    },
    {
      category: 'Booking',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 24 hours before the dinner. Cancellations made within 24 hours may be subject to a cancellation fee.'
    },
    {
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our platform.'
    },
    {
      category: 'Payment',
      question: 'When am I charged for my booking?',
      answer: 'You are charged when you make the booking. The host receives the payment after the dinner has taken place.'
    },
    {
      category: 'Hosting',
      question: 'How do I become a host?',
      answer: 'To become a host, create an account and click on "Become a Host" in your profile. You\'ll need to provide some information about yourself and your cooking experience.'
    },
    {
      category: 'Hosting',
      question: 'What are the requirements for hosting?',
      answer: 'Hosts must have a clean kitchen, follow food safety guidelines, and maintain a high rating from guests. We also require hosts to have appropriate insurance coverage.'
    },
    {
      category: 'Account',
      question: 'How do I update my profile?',
      answer: 'Go to your profile settings, click on "Edit Profile," and update your information. You can change your personal details, profile picture, and preferences.'
    },
    {
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to your account settings, click on "Security," and select "Change Password." Follow the prompts to set a new password.'
    },
    {
      category: 'Safety',
      question: 'What safety measures are in place?',
      answer: 'We verify all hosts, require food safety certifications, and have a review system. We also provide insurance coverage for all bookings.'
    },
    {
      category: 'Safety',
      question: 'What happens if there\'s an issue during the dinner?',
      answer: 'If you encounter any issues, contact our support team immediately. We have a 24/7 support line and will assist you in resolving any problems.'
    }
  ];

  filteredFAQs: FAQItem[] = [...this.faqs];

  filterFAQs() {
    this.filteredFAQs = this.faqs.filter(faq => {
      const matchesSearch = this.searchQuery === '' ||
        faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'All' ||
        faq.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterFAQs();
  }

  toggleItem(question: string) {
    if (this.expandedItems.has(question)) {
      this.expandedItems.delete(question);
    } else {
      this.expandedItems.add(question);
    }
  }
} 