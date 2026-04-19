const { translate } = require('@vitalets/google-translate-api');

async function translateProductText(text) {
  if (!text) return { fr: '', ar: '' };
  
  try {
    // Translate to French
    const resFr = await translate(text, { to: 'fr' });
    // Translate to Arabic
    const resAr = await translate(text, { to: 'ar' });
    
    return {
      fr: resFr.text,
      ar: resAr.text
    };
  } catch (error) {
    console.error('Translation error:', error);
    // If translation fails, fallback to original text
    return {
      fr: text,
      ar: text
    };
  }
}

async function prepareProductTranslations(reqBody) {
  const result = { ...reqBody };
  
  // if no explicit nameFr/nameAr provided via body, generate them natively
  if (result.name && (!result.nameFr || !result.nameAr)) {
     const tName = await translateProductText(result.name);
     result.nameFr = tName.fr;
     result.nameAr = tName.ar;
  }
  
  if (result.description && (!result.descriptionFr || !result.descriptionAr)) {
     const tDesc = await translateProductText(result.description);
     result.descriptionFr = tDesc.fr;
     result.descriptionAr = tDesc.ar;
  }

  return result;
}

module.exports = {
  translateProductText,
  prepareProductTranslations
};
