export const CATEGORIES = ["All", "Wellness", "Prevention", "Nutrition", "Mental Health", "Emergency", "Lifestyle"];

export const BLOG_POSTS = [
    // Wellness
    {
        id: 1,
        title: "Understanding Seasonal Allergies: Symptoms & Prevention",
        excerpt: "As seasons change, many people suffer from allergies. Learn how to identify symptoms and effective ways to prevent them.",
        content: `
      <p>Seasonal allergies, also known as hay fever or allergic rhinitis, affect millions of people worldwide. They occur when the immune system overreacts to outdoor allergens like pollen from trees, grasses, and weeds.</p>
      
      <h3>Common Symptoms</h3>
      <ul>
        <li>Sneezing and runny nose</li>
        <li>Itchy, watery eyes</li>
        <li>Congestion</li>
        <li>Scratchy throat</li>
      </ul>

      <h3>Prevention Tips</h3>
      <p>While you can't completely avoid allergens, you can reduce your exposure:</p>
      <ol>
        <li><strong>Check pollen counts:</strong> Stay indoors on dry, windy days when pollen counts are high.</li>
        <li><strong>Keep windows closed:</strong> Use air conditioning in your home and car.</li>
        <li><strong>Shower after being outdoors:</strong> Remove pollen from your skin and hair.</li>
        <li><strong>Wear a mask:</strong> If you need to do yard work, wear a mask to filter out pollen.</li>
      </ol>

      <h3>Treatment Options</h3>
      <p>Over-the-counter antihistamines and nasal sprays can provide relief. For severe cases, consult a doctor for prescription medications or allergy shots.</p>
    `,
        image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=800&auto=format&fit=crop",
        category: "Wellness",
        author: "Dr. Sarah Smith",
        date: "Dec 02, 2025",
        readTime: "5 min read"
    },
    {
        id: 101,
        title: "The Benefits of Morning Yoga",
        excerpt: "Starting your day with yoga can improve flexibility, reduce stress, and set a positive tone for the rest of the day.",
        content: "<p>Morning yoga practice helps awaken the body and mind...</p>",
        image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=800&auto=format&fit=crop",
        category: "Wellness",
        author: "Dr. Sarah Smith",
        date: "Dec 01, 2025",
        readTime: "4 min read"
    },
    {
        id: 102,
        title: "Hydration: Why It Matters",
        excerpt: "Water is essential for life. Discover the benefits of staying hydrated and how much water you really need.",
        content: "<p>Staying hydrated is crucial for maintaining body temperature, lubricating joints...</p>",
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop",
        category: "Wellness",
        author: "Dt. Anjali Singh",
        date: "Nov 30, 2025",
        readTime: "3 min read"
    },
    {
        id: 103,
        title: "Digital Detox: Unplugging for Health",
        excerpt: "Constant connectivity can lead to stress. Learn how to take a break from screens and recharge your mind.",
        content: "<p>In today's digital age, we are constantly bombarded with notifications...</p>",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800&auto=format&fit=crop",
        category: "Wellness",
        author: "Dr. Emily Chen",
        date: "Nov 29, 2025",
        readTime: "6 min read"
    },
    {
        id: 104,
        title: "The Power of Mindfulness Meditation",
        excerpt: "Mindfulness can reduce anxiety and improve focus. Here is a simple guide to getting started with meditation.",
        content: "<p>Mindfulness is the practice of being present in the moment...</p>",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
        category: "Wellness",
        author: "Dr. Rajesh Kumar",
        date: "Nov 28, 2025",
        readTime: "5 min read"
    },

    // Prevention
    {
        id: 2,
        title: "The Importance of Regular Health Checkups",
        excerpt: "Regular health screenings can detect problems early. Find out which checkups are essential for your age group.",
        content: `
      <p>Many health conditions, such as high blood pressure and diabetes, have no early symptoms. Regular checkups allow doctors to detect these issues before they become serious.</p>
      <h3>Key Screenings by Age</h3>
      <ul>
        <li><strong>20s & 30s:</strong> Blood pressure, cholesterol, skin check, dental exam.</li>
        <li><strong>40s:</strong> Eye exam, diabetes screening, mammogram (women).</li>
        <li><strong>50s+:</strong> Colonoscopy, prostate screening (men), bone density test.</li>
      </ul>
      <p>Don't wait until you feel sick to see a doctor. Preventive care is the best way to maintain long-term health.</p>
    `,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
        category: "Prevention",
        author: "Dr. Rajesh Kumar",
        date: "Nov 28, 2025",
        readTime: "4 min read"
    },
    {
        id: 201,
        title: "Vaccination Schedule for Adults",
        excerpt: "Vaccines aren't just for kids. Learn about the recommended immunizations for adults to stay protected.",
        content: "<p>Adults need vaccines too. Immunity from childhood vaccines can wear off...</p>",
        image: "https://images.unsplash.com/photo-1632053001850-8b1444226d64?q=80&w=800&auto=format&fit=crop",
        category: "Prevention",
        author: "Dr. Michael Brown",
        date: "Nov 27, 2025",
        readTime: "5 min read"
    },
    {
        id: 202,
        title: "Preventing Heart Disease: Top Tips",
        excerpt: "Heart disease is a leading cause of death. Adopt these lifestyle changes to keep your heart healthy.",
        content: "<p>Heart disease is largely preventable with a healthy lifestyle...</p>",
        image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=800&auto=format&fit=crop",
        category: "Prevention",
        author: "Dr. Rajesh Kumar",
        date: "Nov 26, 2025",
        readTime: "6 min read"
    },
    {
        id: 203,
        title: "Sun Safety: Protecting Your Skin",
        excerpt: "Skin cancer is common but preventable. Learn how to protect your skin from harmful UV rays.",
        content: "<p>Exposure to ultraviolet (UV) rays from the sun causes most skin cancers...</p>",
        image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop",
        category: "Prevention",
        author: "Dr. Sarah Smith",
        date: "Nov 25, 2025",
        readTime: "4 min read"
    },
    {
        id: 204,
        title: "Ergonomics at Home: Preventing Back Pain",
        excerpt: "Working from home? Proper ergonomics can prevent back and neck pain. Here's how to set up your workspace.",
        content: "<p>Poor posture while working can lead to chronic pain...</p>",
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop",
        category: "Prevention",
        author: "Dr. Emily Chen",
        date: "Nov 24, 2025",
        readTime: "5 min read"
    },

    // Nutrition
    {
        id: 3,
        title: "5 Superfoods to Boost Your Immunity",
        excerpt: "Strengthen your immune system naturally with these nutrient-rich foods that are easy to include in your diet.",
        content: `
      <p>Your diet plays a major role in how well your immune system functions. Including these superfoods can give you a boost:</p>
      <ol>
        <li><strong>Citrus Fruits:</strong> High in Vitamin C, which increases white blood cell production.</li>
        <li><strong>Garlic:</strong> Contains sulfur compounds that boost the immune response.</li>
        <li><strong>Ginger:</strong> Helps decrease inflammation and reduce sore throat.</li>
        <li><strong>Spinach:</strong> Packed with Vitamin C and antioxidants.</li>
        <li><strong>Yogurt:</strong> Contains probiotics that stimulate the immune system.</li>
      </ol>
      <p>Try adding these to your daily meals for better health!</p>
    `,
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
        category: "Nutrition",
        author: "Dt. Anjali Singh",
        date: "Nov 25, 2025",
        readTime: "6 min read"
    },
    {
        id: 301,
        title: "Plant-Based Diet for Beginners",
        excerpt: "Thinking of going plant-based? Here is a beginner's guide to eating more plants and fewer animal products.",
        content: "<p>A plant-based diet focuses on foods primarily from plants...</p>",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
        category: "Nutrition",
        author: "Dt. Anjali Singh",
        date: "Nov 24, 2025",
        readTime: "7 min read"
    },
    {
        id: 302,
        title: "Understanding Macros: Protein, Carbs, Fats",
        excerpt: "Macronutrients are the building blocks of your diet. Learn what they are and how to balance them.",
        content: "<p>Macronutrients provide energy and are essential for growth...</p>",
        image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop",
        category: "Nutrition",
        author: "Dt. Anjali Singh",
        date: "Nov 23, 2025",
        readTime: "5 min read"
    },
    {
        id: 303,
        title: "Healthy Snacking Ideas",
        excerpt: "Snacking doesn't have to be unhealthy. Here are some delicious and nutritious snack ideas to keep you fueled.",
        content: "<p>Choosing the right snacks can keep your energy levels stable...</p>",
        image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=800&auto=format&fit=crop",
        category: "Nutrition",
        author: "Dt. Anjali Singh",
        date: "Nov 22, 2025",
        readTime: "4 min read"
    },
    {
        id: 304,
        title: "Reducing Sugar Intake",
        excerpt: "Excess sugar can lead to health issues. Discover practical tips to cut down on sugar without sacrificing flavor.",
        content: "<p>High sugar consumption is linked to obesity and diabetes...</p>",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
        category: "Nutrition",
        author: "Dt. Anjali Singh",
        date: "Nov 21, 2025",
        readTime: "5 min read"
    },

    // Mental Health
    {
        id: 4,
        title: "Managing Stress in a Fast-Paced World",
        excerpt: "Chronic stress can impact your physical health. Discover practical techniques to manage stress and improve mental well-being.",
        content: `
      <p>Stress is a natural reaction to challenges, but chronic stress can be harmful. It can lead to headaches, sleep problems, and anxiety.</p>
      <h3>Stress Management Techniques</h3>
      <ul>
        <li><strong>Deep Breathing:</strong> Take slow, deep breaths to calm your nervous system.</li>
        <li><strong>Exercise:</strong> Physical activity releases endorphins, which are natural mood lifters.</li>
        <li><strong>Connect with Others:</strong> Talking to friends or family can provide support.</li>
        <li><strong>Prioritize Tasks:</strong> Focus on what's most important and learn to say no.</li>
      </ul>
      <p>Remember, it's okay to take a break and prioritize your mental health.</p>
    `,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
        category: "Mental Health",
        author: "Dr. Emily Chen",
        date: "Nov 20, 2025",
        readTime: "7 min read"
    },
    {
        id: 401,
        title: "Recognizing Signs of Burnout",
        excerpt: "Burnout is more than just stress. Learn the signs of burnout and how to recover from it.",
        content: "<p>Burnout is a state of emotional, physical, and mental exhaustion...</p>",
        image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=800&auto=format&fit=crop",
        category: "Mental Health",
        author: "Dr. Emily Chen",
        date: "Nov 19, 2025",
        readTime: "6 min read"
    },
    {
        id: 402,
        title: "Anxiety vs. Stress: Knowing the Difference",
        excerpt: "While they share symptoms, anxiety and stress are different. Here's how to tell them apart.",
        content: "<p>Stress is typically caused by an external trigger...</p>",
        image: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?q=80&w=800&auto=format&fit=crop",
        category: "Mental Health",
        author: "Dr. Emily Chen",
        date: "Nov 18, 2025",
        readTime: "5 min read"
    },
    {
        id: 403,
        title: "The Benefits of Journaling",
        excerpt: "Writing down your thoughts can clarify your feelings. Discover the mental health benefits of journaling.",
        content: "<p>Journaling is a simple technique that can help manage mental health...</p>",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
        category: "Mental Health",
        author: "Dr. Emily Chen",
        date: "Nov 17, 2025",
        readTime: "4 min read"
    },
    {
        id: 404,
        title: "Seeking Help: When to Talk to a Professional",
        excerpt: "There is no shame in seeking help. Know when it's time to reach out to a mental health professional.",
        content: "<p>If your mental health is interfering with your daily life...</p>",
        image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=800&auto=format&fit=crop",
        category: "Mental Health",
        author: "Dr. Emily Chen",
        date: "Nov 16, 2025",
        readTime: "5 min read"
    },

    // Emergency
    {
        id: 5,
        title: "First Aid Basics Everyone Should Know",
        excerpt: "Knowing basic first aid can save lives. Here's a quick guide to handling common emergencies before help arrives.",
        content: `
      <p>Accidents happen. Being prepared with basic first aid knowledge can make a huge difference.</p>
      <h3>Common Scenarios</h3>
      <ul>
        <li><strong>Cuts and Scrapes:</strong> Clean the wound with water, apply antibiotic ointment, and cover with a bandage.</li>
        <li><strong>Burns:</strong> Run cool (not cold) water over the burn for 10-15 minutes. Do not pop blisters.</li>
        <li><strong>Nosebleeds:</strong> Lean forward slightly and pinch the soft part of the nose for 10 minutes.</li>
        <li><strong>Sprains:</strong> Use the RICE method: Rest, Ice, Compression, Elevation.</li>
      </ul>
      <p>Always keep a first aid kit handy in your home and car.</p>
    `,
        image: "https://images.unsplash.com/photo-1516574187841-693018954312?q=80&w=800&auto=format&fit=crop",
        category: "Emergency",
        author: "Dr. Michael Brown",
        date: "Nov 15, 2025",
        readTime: "8 min read"
    },
    {
        id: 501,
        title: "CPR: A Life-Saving Skill",
        excerpt: "Cardiopulmonary resuscitation (CPR) can keep blood flowing to the brain during cardiac arrest. Learn the basics.",
        content: "<p>CPR is an emergency procedure that combines chest compressions...</p>",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
        category: "Emergency",
        author: "Dr. Michael Brown",
        date: "Nov 14, 2025",
        readTime: "7 min read"
    },
    {
        id: 502,
        title: "Handling Burns and Cuts at Home",
        excerpt: "Minor injuries can often be treated at home. Learn how to properly care for burns and cuts to prevent infection.",
        content: "<p>Proper wound care is essential for healing...</p>",
        image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=800&auto=format&fit=crop",
        category: "Emergency",
        author: "Dr. Michael Brown",
        date: "Nov 13, 2025",
        readTime: "5 min read"
    },
    {
        id: 503,
        title: "Recognizing Stroke Symptoms (FAST)",
        excerpt: "Time is brain. Learn the FAST acronym to quickly identify stroke symptoms and get help immediately.",
        content: "<p>Stroke is a medical emergency. Use FAST to spot signs...</p>",
        image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=800&auto=format&fit=crop",
        category: "Emergency",
        author: "Dr. Michael Brown",
        date: "Nov 12, 2025",
        readTime: "4 min read"
    },
    {
        id: 504,
        title: "What to Put in Your Emergency Kit",
        excerpt: "Be prepared for disasters. Here is a checklist of essential items to include in your home emergency kit.",
        content: "<p>A well-stocked emergency kit can help you survive...</p>",
        image: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?q=80&w=800&auto=format&fit=crop",
        category: "Emergency",
        author: "Dr. Michael Brown",
        date: "Nov 11, 2025",
        readTime: "6 min read"
    },

    // Lifestyle
    {
        id: 6,
        title: "Sleep Hygiene: Tips for Better Rest",
        excerpt: "Quality sleep is vital for health. Learn about sleep hygiene and how to create a routine for restful nights.",
        content: `
      <p>Sleep hygiene refers to healthy sleep habits. Good sleep is essential for physical and mental health.</p>
      <h3>Tips for Better Sleep</h3>
      <ul>
        <li><strong>Stick to a schedule:</strong> Go to bed and wake up at the same time every day.</li>
        <li><strong>Create a relaxing bedtime routine:</strong> Read a book or take a warm bath.</li>
        <li><strong>Limit screen time:</strong> Avoid phones and computers an hour before bed.</li>
        <li><strong>Watch your diet:</strong> Avoid large meals, caffeine, and alcohol before bedtime.</li>
      </ul>
      <p>If you continue to have trouble sleeping, talk to your doctor.</p>
    `,
        image: "https://images.unsplash.com/photo-1541781777621-713b341c1c14?q=80&w=800&auto=format&fit=crop",
        category: "Lifestyle",
        author: "Dr. Priya Patel",
        date: "Nov 10, 2025",
        readTime: "5 min read"
    },
    {
        id: 601,
        title: "Quitting Smoking: A Timeline of Health Benefits",
        excerpt: "It's never too late to quit. See how your body begins to heal from the moment you stop smoking.",
        content: "<p>Quitting smoking is one of the best things you can do for your health...</p>",
        image: "https://images.unsplash.com/photo-1527756971220-4f83632704ca?q=80&w=800&auto=format&fit=crop",
        category: "Lifestyle",
        author: "Dr. Priya Patel",
        date: "Nov 09, 2025",
        readTime: "6 min read"
    },
    {
        id: 602,
        title: "Alcohol and Health: Moderation is Key",
        excerpt: "Understanding the risks of excessive alcohol consumption and guidelines for moderate drinking.",
        content: "<p>Excessive alcohol use can lead to chronic diseases...</p>",
        image: "https://images.unsplash.com/photo-1516565533887-2e387498b62a?q=80&w=800&auto=format&fit=crop",
        category: "Lifestyle",
        author: "Dr. Priya Patel",
        date: "Nov 08, 2025",
        readTime: "5 min read"
    },
    {
        id: 603,
        title: "Building a Sustainable Exercise Routine",
        excerpt: "Consistency is key to fitness. Learn how to create an exercise plan that you can stick to long-term.",
        content: "<p>Starting an exercise routine is easy, but sticking to it is hard...</p>",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
        category: "Lifestyle",
        author: "Dr. Priya Patel",
        date: "Nov 07, 2025",
        readTime: "7 min read"
    },
    {
        id: 604,
        title: "Healthy Aging: Tips for Seniors",
        excerpt: "Aging gracefully involves taking care of your body and mind. Tips for staying healthy as you get older.",
        content: "<p>Aging is a natural part of life. You can maintain your health...</p>",
        image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=800&auto=format&fit=crop",
        category: "Lifestyle",
        author: "Dr. Priya Patel",
        date: "Nov 06, 2025",
        readTime: "6 min read"
    }
];
