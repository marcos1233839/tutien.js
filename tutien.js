const fs = require("fs");
const path = require("path");

module.exports = class {
  static config = {
    name: "tutien",
    aliases: [],
    version: "6.6.1",
    role: 0,
    author: "God Marcos",
    info: "Tu luyện, độ kiếp, boss, clan, pvp,...",
    Category: "Game",
    guides: "[train|dokiep|info|quest|shop|boss|phai|clan|top|hide|pvp <@tag>]",
    cd: 3,
    hasPrefix: true
  };

  static realms = ["Luyện Khí", "Trúc Cơ", "Kim Đan", "Nguyên Anh", "Hóa Thần", "Luyện Hư", "Độ Kiếp", "Đại Thừa", "Phi Thăng"];
  static dataPath = path.join(__dirname, "..", "..", "system", "data", "tutien.json");
  static bossPath = path.join(__dirname, "..", "..", "system", "data", "boss.json");

  static factions = {
    tien: "🧘 Tu Tiên",
    ma: "😈 Tu Ma",
    phat: "🪷 Tu Phật",
    hachan: "❄️ Hắc Hàn"
  };

  static items = {
    ngoc: { name: "💠 Ngọc May Mắn", price: 2, effect: "+20% tỉ lệ độ kiếp" },
    danexp: { name: "💊 Đan EXP", price: 2, effect: "+1000 EXP" },
    danphuc: { name: "🧪 Đan Hồi Phục", price: 3, effect: "Bảo vệ khi độ kiếp fail" },
    thechat: { name: "💼 Gói Thể Chất", price: 1, effect: "+10~20 Thể Chất" },
    petbox: { name: "🎁 Rương Pet", price: 5, effect: "Mở ra 1 pet ngẫu nhiên" }
  };

  static bossList = [
    { name: "Thần Long", hp: 50000 },
    { name: "Thiên Ưng", hp: 52000 },
    { name: "Bọ Cạp Linh Hồn", hp: 55000 },
    { name: "Hỏa Kỳ Lân", hp: 58000 },
    { name: "Băng Tâm Hồ", hp: 60000 }
  ];

  static petList = [
    "🐶 Chó Nhỏ", "🐱 Mèo Mun", "🦊 Cáo", "🐯 Hổ Nhỏ", "🐲 Rồng Con",
    "🦄 Kỳ Lân", "🐵 Khỉ Thông Minh", "🦅 Ưng Lửa", "🐍 Xà Tinh", "🦖 Khủng Long",
    "👻 Bóng Ma", "🦂 Bọ Cạp Lửa", "🐺 Sói Băng", "🐉 Long Linh", "🧚 Tiên Linh",
    "💀 Lich", "🔥 Phượng Hoàng", "🌪️ Rồng Gió", "⚡ Rồng Sấm", "🌌 Rồng Vũ Trụ"
  ];

  static getAllData() {
    try {
      if (!fs.existsSync(this.dataPath)) return {};
      return JSON.parse(fs.readFileSync(this.dataPath));
    } catch (e) {
      console.error("[tutien] Lỗi đọc data:", e);
      return {};
    }
  }

  static saveAllData(data) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("[tutien] Lỗi lưu data:", e);
    }
  }

  static getBossData() {
    try {
      if (!fs.existsSync(this.bossPath)) {
        const boss = this.createNewBoss();
        this.saveBossData(boss);
        return boss;
      }
      let boss = JSON.parse(fs.readFileSync(this.bossPath));
      const now = Date.now();
      if (boss.defeated && now - boss.defeatTime >= 86400000) {
        boss = this.createNewBoss();
        this.saveBossData(boss);
      }
      return boss;
    } catch (e) {
      console.error("[tutien] Lỗi đọc boss:", e);
      return null;
    }
  }

  static createNewBoss() {
    const pick = this.bossList[Math.floor(Math.random() * this.bossList.length)];
    return {
      name: pick.name,
      hp: pick.hp,
      damage: {},
      defeated: false,
      defeatTime: 0
    };
  }

  static saveBossData(data) {
    try {
      fs.writeFileSync(this.bossPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("[tutien] Lỗi lưu boss:", e);
    }
  }

  static async onLoad() {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.dataPath)) fs.writeFileSync(this.dataPath, "{}");
    if (!fs.existsSync(this.bossPath)) {
      const boss = this.createNewBoss();
      this.saveBossData(boss);
    }
  }

  // ... (phần còn lại giữ nguyên như các phần đã gửi, bao gồm toàn bộ logic clan và các lệnh khác) ...


}