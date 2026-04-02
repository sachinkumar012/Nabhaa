const { generateAvatarVideo } = require('../services/avatarService');

exports.generateAvatarVideoResponse = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    // Call the D-ID service to generate the video URL
    const videoUrl = await generateAvatarVideo(text, language);

    if (videoUrl) {
      return res.json({
        success: true,
        videoUrl
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate avatar video'
      });
    }

  } catch (error) {
    console.error('Avatar Generation API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating avatar'
    });
  }
};
