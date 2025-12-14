exports.getDoctors = (req, res) => {
    const { specialty } = req.query;

    const doctors = [
        {
            id: 1,
            name: "Dr. Sharma",
            specialty: "General Physician",
            experience: "15 years",
            location: "Nabha Main Hospital",
            rating: 4.8,
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 2,
            name: "Dr. Priya Singh",
            specialty: "Cardiologist",
            experience: "10 years",
            location: "Heart Care Center",
            rating: 4.9,
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 3,
            name: "Dr. Rajesh Kumar",
            specialty: "Dermatologist",
            experience: "8 years",
            location: "Skin & Glow Clinic",
            rating: 4.7,
            image: "https://randomuser.me/api/portraits/men/67.jpg"
        },
        {
            id: 4,
            name: "Dr. Anjali Gupta",
            specialty: "Pediatrician",
            experience: "12 years",
            location: "Child Care Hospital",
            rating: 4.9,
            image: "https://randomuser.me/api/portraits/women/28.jpg"
        },
        {
            id: 5,
            name: "Dr. Vikram Malhotra",
            specialty: "Orthopedic",
            experience: "20 years",
            location: "Bone & Joint Clinic",
            rating: 4.6,
            image: "https://randomuser.me/api/portraits/men/11.jpg"
        }
    ];

    let results = doctors;
    if (specialty) {
        results = doctors.filter(doc =>
            doc.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
    }

    res.status(200).json({
        success: true,
        count: results.length,
        data: results
    });
};
