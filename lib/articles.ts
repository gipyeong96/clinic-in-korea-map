export interface Article {
  slug: string;
  title_en: string;
  title_mn: string;
  published_at: string;
  content_en: string;
  content_mn: string;
  summary_en?: string;
  summary_mn?: string;
  main_image?: string;
}

export const mockArticles: Article[] = [
  {
    slug: "things-to-know-before-visiting-urology-clinic",
    title_en: "3 Things You Must Know Before Visiting a Urology Clinic in Seoul",
    title_mn: "Сөүлд бөөрний эмнэлэгт очихоосоо өмнө мэдэх ёстой 3 зүйл",
    published_at: "2026-08-25",
    summary_en: "Visiting a urology clinic in a foreign country can be intimidating. Keep in mind multi-lingual support, diagnostic equipment availability, and treatment options.",
    summary_mn: "Гадаад улсад шээс бэлгийн замын эмнэлэгт очих нь сүрдмээр санагдаж магадгүй юм. Хэлний дэмжлэг, оношилгооны төхөөрөмж зэргийг сайтар шалгаарай.",
    content_en: `
      Visiting a urology clinic in a foreign country can be intimidating. Here are three critical factors to keep in mind to ensure a smooth, professional, and comfortable experience.

      ### 1. Confirm English or Multi-lingual Support
      Urology concerns require precise communication of delicate symptoms. Ensure the clinic has certified medical translators or English-speaking specialists. Clinics like Goldman Urology Clinic support English, Mongolian, and Russian.

      ### 2. Verify Diagnostic Equipment Availability
      Urological diagnoses rely heavily on high-resolution ultrasound, PCR testing kits, and endoscopic devices. Choose a clinic that conducts same-day multiplex PCR tests for rapid results, allowing you to begin treatment immediately.

      ### 3. Check for Advanced Minimally Invasive Treatment Options
      For conditions like Benign Prostatic Hyperplasia (BPH), check if the clinic offers modern treatments like Holep, Rezum, or Aquablation, which minimize side effects and quicken recovery compared to traditional open surgeries.
    `,
    content_mn: `
      Гадаад улсад шээс бэлгийн замын эмнэлэгт очих нь сүрдмээр санагдаж магадгүй юм. Тайван, мэргэжлийн, тухтай үйлчилгээ авахын тулд дараах 3 хүчин зүйлийг анхаарна уу.

      ### 1. Гадаад хэлний дэмжлэг байгаа эсэхийг баталгаажуулах
      Симптомоо үнэн зөв тайлбарлах нь эмчилгээний үр дүнд маш чухал. Эмнэлэгт мэргэжлийн орчуулагч эсвэл англиар ярьдаг эмч байгаа эсэхийг шалгаарай. Жишээлбэл, Голдман бөөрний эмнэлэг нь англи, монгол, орос хэлний дэмжлэгтэй байдаг.

      ### 2. Оношилгооны тоног төхөөрөмжийг шалгах
      Бөөр, шээсний замын өвчний оношилгоонд хэт авиан шинжилгээ, PCR тест чухал үүрэгтэй. Түргэн хугацаанд үр дүнгээ гаргаж, эмчилгээг цаг алдалгүй эхлүүлэхийн тулд нэг өдөртөө багтаж PCR шинжилгээ хийдэг эмнэлгийг сонгох хэрэгтэй.

      ### 3. Бага зүсэлттэй дэвшилтэт эмчилгээ хийгддэг эсэх
      Түрүү булчирхайн томрол зэрэг өвчний үед Holep, Rezum, Aquablation гэх мэт мэс заслын бус дэвшилтэт аргууд байгаа эсэхийг шалгаарай. Эдгээр нь уламжлалт хагалгаатай харьцуулахад нөхөн сэргэлтийн хугацааг ихээхэн хэмжээгээр богиносгодог.
    `
  }
];
