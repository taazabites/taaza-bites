import { FAQ_DATA } from './FaqData';
import { LOCALITY_DATA_MAP, LOCALITY_PATH_KEYS, GOAL_DATA_MAP, GOAL_PATH_KEYS } from '../seoLocalityData';

export function getSchemasForPath(path: string): any[] {
    const defaultOrg = {
        "@context": "https://schema.org",
        "@type": ["Organization", "Corporation", "FoodEstablishment"],
        "name": "Taaza Bites",
        "legalName": "Taazabites Culinary Health Solutions Pvt Ltd",
        "url": "https://www.taazabites.in",
        "logo": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
        "description": "Bengaluru's premier healthy food delivery and diet meal subscription service. Specializing in weight loss, muscle gain, and high-protein chef-crafted meals.",
        "foundingDate": "2023",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-7975771457",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": "en",
            "contactOption": "TollFree"
        },
        "sameAs": [
            "https://www.instagram.com/taazabites",
            "https://www.facebook.com/taazabites"
        ],
        "brand": {
            "@type": "Brand",
            "name": "Taaza Bites"
        }
    };

    const defaultLocalBus = {
        "@context": "https://schema.org",
        "@type": "FoodEstablishment",
        "name": "Taazabites",
        "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
        "@id": "https://www.taazabites.in",
        "url": "https://www.taazabites.in",
        "telephone": "+91-7975771457",
        "hasCertification": {
            "@type": "Certification",
            "name": "FSSAI Certified",
            "identifier": "21223188002425"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Taazabites Headquarters, Sarjapur Main Road, Kasavanahalli",
            "addressLocality": "Bengaluru",
            "addressRegion": "KA",
            "postalCode": "560035",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 12.9092,
            "longitude": 77.6749
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
            ],
            "opens": "07:00",
            "closes": "22:00"
        },
        "servesCuisine": "Healthy, Nutritious, Indian, Keto, High-Protein, Low-GI, Weight-Loss, Gluten-Free",
        "priceRange": "₹₹",
        "areaServed": [
            { "@type": "AdministrativeArea", "name": "HSR Layout, Bengaluru" },
            { "@type": "AdministrativeArea", "name": "Koramangala, Bengaluru" },
            { "@type": "AdministrativeArea", "name": "Sarjapur Road, Bengaluru" },
            { "@type": "AdministrativeArea", "name": "Kasavanahalli, Bengaluru" },
            { "@type": "AdministrativeArea", "name": "Haralur Road, Bengaluru" },
            { "@type": "AdministrativeArea", "name": "Bellandur, Bengaluru" }
        ],
        "potentialAction": {
            "@type": "OrderAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.taazabites.in/subscriptions",
                "inLanguage": "en",
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                ]
            },
            "deliveryMethod": ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"],
            "priceSpecification": {
                "@type": "DeliveryChargeSpecification",
                "price": "0",
                "priceCurrency": "INR",
                "appliesToDeliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
            }
        }
    };

    // Scientific/Analytical Nutrition Dataset Schema for GEO
    const macroDatasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "Taazabites Nutritional Metrics and Sourcing Data",
        "description": "Comprehensive nutritional specifications detailing exact macronutrient profiles (19g-40g protein/meal, 415-515 calories/meal) and ingredient sourcing data for Taazabites subscription plans in Bengaluru.",
        "creator": {
            "@type": "Organization",
            "name": "Taazabites Clinical Nutrition Lab"
        },
        "variableMeasured": [
            "Protein content per meal (19g to 40g depending on veg/non-veg selection)",
            "Caloric count per meal (415 kcal to 515 kcal base)",
            "Absence of refined vegetable oils and artificial preservatives",
            "Use of cold-pressed sunflower oil, organic ghee, and whole olive oil"
        ],
        "temporalCoverage": "2026-01-01/2026-12-31",
        "spatialCoverage": {
            "@type": "Place",
            "name": "Bengaluru, Karnataka, India"
        },
        "license": "https://www.taazabites.in/terms"
    };

    // Top-Level Site Navigation Elements for Crawler indexing
    const siteNavigationSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Taazabites Priority Navigation Map",
        "itemListElement": [
            {
                "@type": "SiteNavigationElement",
                "position": 1,
                "name": "Healthy Subscriptions",
                "url": "https://www.taazabites.in/subscriptions"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 2,
                "name": "Weekly Menu",
                "url": "https://www.taazabites.in/menu"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 3,
                "name": "Why Choose Us",
                "url": "https://www.taazabites.in/why-us"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 4,
                "name": "Nutritional Insights",
                "url": "https://www.taazabites.in/nutrition-approach"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 5,
                "name": "Careers",
                "url": "https://www.taazabites.in/careers"
            }
        ]
    };

    // GENERATIVE ENGINE OPTIMIZATION (GEO)
    // SGE & AI-Search Authenticity Sourcing
    const geoFaqQuestions = [
        {
            "@type": "Question",
            "name": "Is Taazabites certified by government food authorities?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Taazabites is operated under FSSAI central cloud-kitchen license number 21223188002425. Every preparation batch undergoes strict compliance audits according to ISO 22000 and standard HACCP parameters."
            }
        },
        {
            "@type": "Question",
            "name": "Are there any chemical preservatives, artificial colors or GMOs?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zero. Every single plan is 100% free of refined vegetable oils, parabens, artificial coloring, chemical preservatives, or added MSG. We utilize cold-pressed premium sunflower, organic ghee, and whole olive oil exclusively."
            }
        },
        {
            "@type": "Question",
            "name": "Where precisely does Taazabites deliver inside Bengaluru?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We deliver daily between 8 AM and 8 PM across major Bengaluru zones including HSR Layout, Koramangala, Sarjapur Road, Kasavanahalli, Haralur Road, and Bellandur (with upcoming coverage in Indiranagar, BTM Layout, Jayanagar, JP Nagar, Electronic City, Hebbal, Yelahanka, Whitefield, KR Puram, and MG Road)."
            }
        },
        {
            "@type": "Question",
            "name": "What is the pause, scheduling and refund protocol?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Subscriptions are fully flexible with zero penalty hold options. Users can pause, skip or redirect order coordinates inside their active dashboard. Unused active days are backed up inside credit days. Refunds follow 48h cancel notices."
            }
        }
    ];

    const schemas: any[] = [];

    // Always include base schemas for trust, GEO mapping
    
    const coreServiceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Taaza Bites Healthy Meal Subscription",
        "serviceType": "Meal Delivery Service",
        "provider": {
            "@id": "https://www.taazabites.in"
        },
        "description": "Daily delivery of chef-crafted, macro-calculated healthy meals in Bengaluru. Options for weight loss, high protein, and keto diets.",
        "areaServed": [
            { "@type": "City", "name": "Bengaluru" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Meal Subscription Plans",
            "itemListElement": [
                {
                    "@type": "OfferCatalog",
                    "name": "Weight Loss Meal Plan",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Calorie Deficit Diet"
                            }
                        }
                    ]
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Muscle Gain Meal Plan",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "High Protein Diet"
                            }
                        }
                    ]
                }
            ]
        }
    };
    schemas.push(coreServiceSchema);

    // LocalBusiness specific schema for Map Pack
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["FoodEstablishment", "LocalBusiness"],
        "name": "Taaza Bites",
        "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
        "@id": "https://www.taazabites.in",
        "url": "https://www.taazabites.in",
        "telephone": "+91-7975771457",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Kasavanahalli",
            "addressLocality": "Bengaluru",
            "addressRegion": "KA",
            "postalCode": "560035",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 12.9716,
            "longitude": 77.5946
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        },
        "priceRange": "₹₹",
        "servesCuisine": ["Healthy", "Keto", "High-Protein", "Indian"]
    };
    schemas.push(localBusinessSchema);


    schemas.push(macroDatasetSchema);
    schemas.push(siteNavigationSchema);

    const cleanPath = path || '/';

    // Generic WebPage Schema for AEO/GEO semantic association
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `Taazabites - ${cleanPath === '/' ? 'Home' : cleanPath.replace(/\//g, ' ').trim()}`,
        "url": `https://www.taazabites.in${cleanPath}`,
        "publisher": defaultOrg,
        "isPartOf": {
            "@type": "WebSite",
            "name": "Taazabites",
            "url": "https://www.taazabites.in"
        },
        "about": {
            "@type": "Thing",
            "name": "Healthy Food Delivery in Bengaluru"
        },
        "mentions": [
            { "@type": "Thing", "name": "Nutrition" },
            { "@type": "Thing", "name": "Meal Prep" },
            { "@type": "Thing", "name": "Healthy Lifestyle" }
        ]
    };
    schemas.push(webPageSchema);

    // DYNAMIC FAQ SCHEMA INJECTION FOR AEO/GEO
    // This ensures every locality and goal page automatically has valid FAQPage JSON-LD
    const locKey = LOCALITY_PATH_KEYS[cleanPath];
    const goalKey = GOAL_PATH_KEYS[cleanPath];
    
    let pageSpecificFaqs: { q: string, a: string }[] = [];
    
    if (locKey && LOCALITY_DATA_MAP[locKey]) {
        pageSpecificFaqs = [...LOCALITY_DATA_MAP[locKey].faqs];
    } else if (goalKey && GOAL_DATA_MAP[goalKey]) {
        pageSpecificFaqs = [...GOAL_DATA_MAP[goalKey].faqs];
    }

    if (pageSpecificFaqs.length > 0) {
        const dynamicFaqPage = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": pageSpecificFaqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                }
            }))
        };
        schemas.push(dynamicFaqPage);
    }

    // Page Specific schemas
    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/faq') {
        const faqPage = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                ...geoFaqQuestions,
                ...FAQ_DATA.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            ]
        };
        schemas.push(faqPage);
    }

    if (cleanPath === '/subscriptions') {
        const peakPerformancePlan = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Peak Performance (5-Day Beginner Trial Plan) | Taazabites",
            "image": "https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg",
            "description": "Premium 5-day healthy nutrition subscription plan optimized for peak cognitive and physical performance. Choice of Veg, Eggitarian, and Non-Vegetarian. Freshly delivered across Bengaluru.",
            "brand": {
                "@type": "Brand",
                "name": "Taazabites"
            },
            "category": "Diet meal plans",
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "lowPrice": "1545",
                "highPrice": "1645",
                "offerCount": "3",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Peak Performance - 5-Day Veg Plan",
                        "price": "1545",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "Peak Performance - 5-Day Eggitarian Plan",
                        "price": "1545",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "Peak Performance - 5-Day Non-Veg Plan",
                        "price": "1645",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    }
                ]
            }
        };

        const habitPlan = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "The Habit (20-Day Full Month Plan) | Taazabites",
            "image": "https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg",
            "description": "Establish a healthy diet habit with 20 days of premium chef-crafted meals. Highly customizable macros with Pause anytime features.",
            "brand": {
                "@type": "Brand",
                "name": "Taazabites"
            },
            "category": "Diet meal plans",
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "lowPrice": "5900",
                "highPrice": "6100",
                "offerCount": "3",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "The Habit - 20-Day Veg Plan",
                        "price": "5900",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "The Habit - 20-Day Eggitarian Plan",
                        "price": "5900",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "The Habit - 20-Day Non-Veg Plan",
                        "price": "6100",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    }
                ]
            }
        };

        const transformationPlan = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Transformation (60-Day Lifestyle Plan) | Taazabites",
            "image": "https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/FzHllQL-b5013e53-f312-455d-9ef5-7c51f71950e2.jpg",
            "description": "Complete 60-day dietary transformation program. Direct access to diet consultations, organic ingredient premium sourcing, and maximum relative savings.",
            "brand": {
                "@type": "Brand",
                "name": "Taazabites"
            },
            "category": "Diet meal plans",
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "lowPrice": "16800",
                "highPrice": "17400",
                "offerCount": "3",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Transformation - 60-Day Veg Plan",
                        "price": "16800",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "Transformation - 60-Day Eggitarian Plan",
                        "price": "16800",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    },
                    {
                        "@type": "Offer",
                        "name": "Transformation - 60-Day Non-Veg Plan",
                        "price": "17400",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2026-01-01"
                    }
                ]
            }
        };

        const subscriptionsFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "How much does Taazabites Peak Performance plan cost?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The Peak Performance plan costs ₹1,545 for 5 days of a vegetarian diet (single meal per day). The non-vegetarian option starts at ₹1,645."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How much is The Habit plan?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The Habit plan is priced at ₹5,900 for 20 days of delivery (vegetarian diet, single meal). Non-vegetarian starts at ₹6,100."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the cost of the Transformation plan?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The Transformation plan costs ₹16,800 for 60 days on a vegetarian diet (single meal per day). Non-vegetarian options start at ₹17,400."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does Taazabites deliver daily to HSR Layout?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we provide daily scheduled deliveries to all sectors of HSR Layout, covering both residential addresses and corporate tech parks."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the delivery cutoff time for HSR Layout?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "To receive your meal the next day in HSR Layout, please complete your subscription or daily order by 8:00 PM."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is healthy meal delivery available in Koramangala?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, Taazabites delivers freshly prepared, macro-calculated healthy meals across all blocks of Koramangala."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver lunch to Koramangala offices?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Absolutely. We offer dedicated lunchtime deliveries directly to corporate offices and co-working spaces in Koramangala."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Can I get a monthly diet plan delivered to Sarjapur Road?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, our Habit (20-day) and Lifestyle (60-day) subscription plans are fully available for delivery along Sarjapur Road and adjacent areas."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Are deliveries on Sarjapur Road handled by trained staff?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, all our deliveries along the Sarjapur corridor are executed by our trained hygiene-compliant logistics partners."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does Taazabites deliver to ITPL and Whitefield tech parks?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we regularly deliver healthy meal subscriptions to major tech parks and residential enclaves in Whitefield."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How does Whitefield delivery packaging handle transit?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our meals arrive in premium, temperature-stable compostable eco-friendly food containers, ensuring your food stays fresh and safe during the commute to Whitefield."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Indiranagar?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Indiranagar."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Can I pause my Indiranagar meal delivery if I travel?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, active subscribers in Indiranagar can easily pause and resume their meal deliveries via our support channel."
                    }
                }
            ]
        };

        schemas.push(peakPerformancePlan);
        schemas.push(habitPlan);
        schemas.push(transformationPlan);
        schemas.push(subscriptionsFaq);
    }

    if (cleanPath === '/about') {
        const aboutPageSchema = {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Taazabites",
            "description": "Engineered for high-performance organic living through premium sourcing and precise macronutrient formulation.",
            "publisher": defaultOrg
        };
        schemas.push(aboutPageSchema);
    }

    if (cleanPath === '/contact') {
        const contactPageSchema = {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Taazabites",
            "description": "Get in touch with Taazabites for healthy meal delivery in Bangalore.",
            "url": "https://www.taazabites.in/contact",
            "mainEntity": {
                "@type": "Organization",
                "name": "Taazabites",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-7975771457",
                    "contactType": "customer service",
                    "email": "support@taazabites.in",
                    "areaServed": "IN",
                    "availableLanguage": ["en", "hi"]
                }
            }
        };
        schemas.push(contactPageSchema);
    }

    if (cleanPath === '/corporate-booking') {
        const serviceSchema = {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Corporate Wellness Catering Bengaluru",
            "serviceType": "Healthy Food Catering",
            "provider": defaultOrg,
            "areaServed": {
                "@type": "City",
                "name": "Bengaluru"
            },
            "description": "Premium healthy corporate meal delivery and catering services in Bengaluru. Boost employee productivity with nutritious, chef-prepared office lunches.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            }
        };
        schemas.push(serviceSchema);
    }

    if (cleanPath === '/menu') {
        const menuSchema = {
            "@context": "https://schema.org",
            "@type": "Menu",
            "name": "Taazabites Weekly Premium Menu",
            "mainEntityOfPage": "https://www.taazabites.in/menu",
            "description": "Weekly menu of nutritious premium meals delivered fresh in Bangalore.",
            "inLanguage": "en"
        };
        schemas.push(menuSchema);
    }

    if (cleanPath === '/meal-delivery-hsr-layout') {
        const localHsrSchema = {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Taazabites HSR Layout Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in HSR Layout, Bengaluru. High-protein, keto, and weight loss subscriptions delivered fresh daily.",
            "image": "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
            "url": "https://www.taazabites.in/meal-delivery-hsr-layout",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Sector 3, HSR Layout",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560102",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9141,
                "longitude": 77.6413
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "HSR Layout" },
                { "@type": "AdministrativeArea", "name": "Haralur Road" },
                { "@type": "AdministrativeArea", "name": "Kudlu Gate" },
                { "@type": "AdministrativeArea", "name": "Sector 1 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 2 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 3 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 4 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 5 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 6 HSR" },
                { "@type": "AdministrativeArea", "name": "Sector 7 HSR" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:30",
                    "closes": "20:30"
                }
            ]
        };
        schemas.push(localHsrSchema);
    }

    if (cleanPath === '/meal-delivery-koramangala') {
        const localKoraSchema = {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Taazabites Koramangala Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Koramangala, Bengaluru. Freshly prepared, macro-calculated nutrition for professionals.",
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
            "url": "https://www.taazabites.in/meal-delivery-koramangala",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "80 Feet Road, Koramangala",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560034",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9352,
                "longitude": 77.6244
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Koramangala" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 1" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 2" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 3" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 4" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 5" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 6" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 7" },
                { "@type": "AdministrativeArea", "name": "Koramangala Block 8" },
                { "@type": "AdministrativeArea", "name": "Ejipura" },
                { "@type": "AdministrativeArea", "name": "SG Palya" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:45",
                    "closes": "20:45"
                }
            ]
        };
        schemas.push(localKoraSchema);
    }

    if (cleanPath === '/meal-delivery-whitefield') {
        const localWhiteSchema = {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Taazabites Whitefield Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Whitefield, Bengaluru. Macro-perfect lunches and dinners delivered daily to your office or home.",
            "image": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
            "url": "https://www.taazabites.in/meal-delivery-whitefield",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "ITPL Main Road, Whitefield",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560066",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9698,
                "longitude": 77.7499
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Whitefield" },
                { "@type": "AdministrativeArea", "name": "ITPL" },
                { "@type": "AdministrativeArea", "name": "Hope Farm" },
                { "@type": "AdministrativeArea", "name": "Hoodi" },
                { "@type": "AdministrativeArea", "name": "Kadugodi" },
                { "@type": "AdministrativeArea", "name": "Varthur" },
                { "@type": "AdministrativeArea", "name": "Outer Ring Road Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "08:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localWhiteSchema);
    }

    if (cleanPath === '/meal-delivery-indiranagar') {
        const localIndiraSchema = {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Taazabites Indiranagar Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Indiranagar, Bengaluru. Highly customized, nutritious subscriptions for active lifestyles.",
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
            "url": "https://www.taazabites.in/meal-delivery-indiranagar",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "100 Feet Road, Indiranagar",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560038",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9784,
                "longitude": 77.6408
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Indiranagar" },
                { "@type": "AdministrativeArea", "name": "HAL Stage 2" },
                { "@type": "AdministrativeArea", "name": "HAL Stage 3" },
                { "@type": "AdministrativeArea", "name": "Defense Colony" },
                { "@type": "AdministrativeArea", "name": "Jeevanbheemanagar" },
                { "@type": "AdministrativeArea", "name": "Domlur" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:15",
                    "closes": "20:30"
                }
            ]
        };
        schemas.push(localIndiraSchema);
    }

    if (cleanPath === '/meal-delivery-sarjapur-road') {
        const localSarjapurSchema = {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Taazabites Flagship Kitchen & Sarjapur Road Outlet",
            "description": "The headquarters of Taazabites' flagship culinary kitchen and central dispatch outlet. Delivering freshly prepared, premium chef-crafted healthy meal subscriptions across Sarjapur Road, Kasavanahalli, Haralur Road, and all surrounding residential communities and tech corridors.",
            "image": "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
            "url": "https://www.taazabites.in/meal-delivery-sarjapur-road",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Taazabites Headquarters, Sarjapur Main Road, Kasavanahalli",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560035",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9092,
                "longitude": 77.6749
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss", "Low-GI", "Gluten-Free"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Sarjapur Road" },
                { "@type": "AdministrativeArea", "name": "Kasavanahalli" },
                { "@type": "AdministrativeArea", "name": "Kasavanahalli Main Road" },
                { "@type": "AdministrativeArea", "name": "Haralur Road" },
                { "@type": "AdministrativeArea", "name": "Kaikondrahalli" },
                { "@type": "AdministrativeArea", "name": "Bellandur" },
                { "@type": "AdministrativeArea", "name": "Carmelaram" },
                { "@type": "AdministrativeArea", "name": "Doddakannelli" },
                { "@type": "AdministrativeArea", "name": "Chikkanayakanahalli" },
                { "@type": "AdministrativeArea", "name": "Junnasandra" },
                { "@type": "AdministrativeArea", "name": "Sompura" },
                { "@type": "AdministrativeArea", "name": "Kodathi" },
                { "@type": "AdministrativeArea", "name": "Halanayakanahalli" },
                { "@type": "AdministrativeArea", "name": "Chikkakannelli" },
                { "@type": "AdministrativeArea", "name": "Wipro Sarjapur Road Campus" },
                { "@type": "AdministrativeArea", "name": "RGA Tech Park" },
                { "@type": "AdministrativeArea", "name": "RMZ Ecoworld" },
                { "@type": "AdministrativeArea", "name": "RMZ Ecospace" },
                { "@type": "AdministrativeArea", "name": "Adarsh Palm Retreat" },
                { "@type": "AdministrativeArea", "name": "Sobha Royal Pavilion" },
                { "@type": "AdministrativeArea", "name": "Bren Avalon" },
                { "@type": "AdministrativeArea", "name": "SJR Verity" },
                { "@type": "AdministrativeArea", "name": "Salarpuria Sattva Senorita" },
                { "@type": "AdministrativeArea", "name": "Prestige Sunrise Park" },
                { "@type": "AdministrativeArea", "name": "Godrej Reflections" },
                { "@type": "AdministrativeArea", "name": "Shriram Chirping Woods" },
                { "@type": "AdministrativeArea", "name": "SJR Blue Waters" },
                { "@type": "AdministrativeArea", "name": "Purva Whitehall" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:30",
                    "closes": "20:30"
                }
            ]
        };
        schemas.push(localSarjapurSchema);
    }

    
    if (cleanPath === '/meal-delivery-kasavanahalli') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Kasavanahalli Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Kasavanahalli, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-kasavanahalli",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Kasavanahalli",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560035",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9092,
                "longitude": 77.6749
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Kasavanahalli" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
    }

    if (cleanPath === '/meal-delivery-haralur') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Haralur Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Haralur, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-haralur",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Haralur",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560102",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9038,
                "longitude": 77.6631
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Haralur" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
    }

    if (cleanPath === '/meal-delivery-bellandur') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Bellandur Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Bellandur, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-bellandur",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Bellandur",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560103",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9304,
                "longitude": 77.6784
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Bellandur" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
    }

    if (cleanPath === '/meal-delivery-marathahalli') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Marathahalli Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Marathahalli, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-marathahalli",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Marathahalli",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560037",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9569,
                "longitude": 77.7011
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Marathahalli" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
    }

    if (cleanPath === '/meal-delivery-electronic-city') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Electronic City Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Electronic City, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-electronic-city",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Electronic City",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560100",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.8452,
                "longitude": 77.6602
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Electronic City" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Electronic City?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Electronic City, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to Electronic City?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to Electronic City directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    if (cleanPath === '/meal-delivery-jp-nagar') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites JP Nagar Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in JP Nagar, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-jp-nagar",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "JP Nagar",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560078",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9063,
                "longitude": 77.5857
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "JP Nagar" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
    }

    if (cleanPath === '/meal-delivery-jayanagar') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Jayanagar Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Jayanagar, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-jayanagar",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jayanagar",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560041",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9299,
                "longitude": 77.5822
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Jayanagar" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Jayanagar?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Jayanagar, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to Jayanagar?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to Jayanagar directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    if (cleanPath === '/meal-delivery-btm-layout') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites BTM Layout Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in BTM Layout, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-btm-layout",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "BTM Layout",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560076",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.9166,
                "longitude": 77.6101
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "BTM Layout" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in BTM Layout?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in BTM Layout, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to BTM Layout?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to BTM Layout directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    if (cleanPath === '/meal-delivery-hebbal') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Hebbal Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Hebbal, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-hebbal",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Hebbal",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560024",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 13.0354,
                "longitude": 77.5988
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Hebbal" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Hebbal?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Hebbal, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to Hebbal?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to Hebbal directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    if (cleanPath === '/meal-delivery-yelahanka') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Yelahanka Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Yelahanka, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-yelahanka",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Yelahanka",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560064",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 13.1007,
                "longitude": 77.5963
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Yelahanka" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Yelahanka?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Yelahanka, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to Yelahanka?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to Yelahanka directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    if (cleanPath === '/meal-delivery-mahadevapura') {
        const localSchema = {
            "@context": "https://schema.org",
            "@type": ["FoodEstablishment", "LocalBusiness"],
            "name": "Taaza Bites Mahadevapura Meal Delivery",
            "description": "Chef-crafted healthy diet meal delivery in Mahadevapura, Bengaluru. Customized for weight loss and muscle gain.",
            "image": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg",
            "url": "https://www.taazabites.in/meal-delivery-mahadevapura",
            "telephone": "+91-7975771457",
            "priceRange": "₹₹",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mahadevapura",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560048",
                "addressCountry": "IN"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 12.988,
                "longitude": 77.6895
            },
            "servesCuisine": ["Healthy", "Keto", "High-Protein", "Weight-Loss"],
            "areaServed": [
                { "@type": "AdministrativeArea", "name": "Mahadevapura" },
                { "@type": "AdministrativeArea", "name": "Bengaluru" }
            ],
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "07:00",
                    "closes": "21:00"
                }
            ]
        };
        schemas.push(localSchema);
        
        const localFaq = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What diet plans are available for delivery in Mahadevapura?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Mahadevapura, Bengaluru."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do you deliver daily to Mahadevapura?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, we deliver daily to Mahadevapura directly to your home or office during specific time slots for breakfast, lunch, and dinner."
                    }
                }
            ]
        };
        schemas.push(localFaq);
    }

    return schemas;
}
