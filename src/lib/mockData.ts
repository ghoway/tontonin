// Mock data for testing when API is unavailable (e.g., IP banned)
export const MOCK_DRAMAS = [
  {
    bookId: '41000116666',
    bookName: 'Ikatan Ayah dan Putri yang Dicuri',
    coverWap: 'https://cover.dramaboxdb.com/image/41000116666.jpg',
    chapterCount: 78,
    playCount: '2.5M',
    introduction: 'Sebuah cerita tentang ikatan ayah dan putri yang kuat melalui berbagai tantangan hidup.',
    tags: ['Drama', 'Family', 'Indonesia'],
  },
  {
    bookId: '41000116667',
    bookName: 'Menghibah Takdir si Villain',
    coverWap: 'https://cover.dramaboxdb.com/image/41000116667.jpg',
    chapterCount: 45,
    playCount: '1.8M',
    introduction: 'Penceritaan ulang kisah villain yang ternyata memiliki cerita latar belakang yang menyedihkan.',
    tags: ['Drama', 'Fantasy'],
  },
  {
    bookId: '41000116668',
    bookName: 'Menghambat Ayah Tri Munafik',
    coverWap: 'https://cover.dramaboxdb.com/image/41000116668.jpg',
    chapterCount: 56,
    playCount: '1.2M',
    introduction: 'Drama yang mengungkap sisi tersembunyi dari kepribadian ganda seseorang.',
    tags: ['Drama', 'Thriller'],
  },
  {
    bookId: '41000116669',
    bookName: 'Mist Bertahan Hidup: Turunkan Tingkat...',
    coverWap: 'https://cover.dramaboxdb.com/image/41000116669.jpg',
    chapterCount: 63,
    playCount: '980K',
    introduction: 'Survial drama yang menampilkan perjuangan bertahan dalam kondisi ekstrem.',
    tags: ['Action', 'Survival'],
  },
  {
    bookId: '41000116670',
    bookName: 'Permainan Dimulai, Kubalas Semua',
    coverWap: 'https://cover.dramaboxdb.com/image/41000116670.jpg',
    chapterCount: 52,
    playCount: '750K',
    introduction: 'Revenge drama penuh twist dan kejutan yang membuat penonton terus menebak.',
    tags: ['Drama', 'Revenge'],
  },
];

export const MOCK_EPISODES = Array.from({ length: 12 }, (_, i) => ({
  episode: i + 1,
  streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
}));
