import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function Pricing({ onSubscribe }) {
  const plans = [
    {
      name: "Data Access Program",
      price: "₹25,000",
      period: "Annual",
      description: "Full access to international procurement data and buyer contacts.",
      features: ["Verified Procurement Contacts", "195 Country Data", "Direct WhatsApp/LinkedIn Access", "Bulk Data Downloads"]
    },
    {
      name: "Sales Partner Expansion",
      price: "₹45,000",
      period: "Semi-Annual",
      description: "Dedicated assistance for global sales growth and market entry.",
      features: ["All Data Access Features", "Direct Sales Matching", "Market Entry Consultation", "Priority AI Support"]
    },
    {
      name: "Enterprise Custom Plan",
      price: "Custom",
      period: "On Demand",
      description: "Tailored trade intelligence for large-scale operations.",
      features: ["Custom API Integration", "Dedicated Success Manager", "Real-time Compliance Tracking", "White-glove Sourcing"]
    }
  ];

  return (
    <section id="pricing" className="pricing-section">
      <div className="section-header">
        <h2>Choose Your Program</h2>
        <p>Strategic investment for global market domination.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${index === 1 ? 'featured' : ''}`}>
            {index === 1 && <div className="featured-badge">Most Popular</div>}
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <div className="plan-price">
              <span className="price-value">{plan.price}</span>
              {plan.period !== 'On Demand' && <span className="price-period">/ {plan.period}</span>}
            </div>
            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}><Check size={18} className="text-success" /> {feature}</li>
              ))}
            </ul>
            <button 
              className={`btn-${index === 1 ? 'primary' : 'outline'}-full`} 
              onClick={() => onSubscribe(plan.name, plan.price)}
            >
              {plan.price === 'Custom' ? 'Contact for Custom Plan' : 'Buy Access Now'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
