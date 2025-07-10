const fs = require("fs");
const path = require("path");

module.exports = class {
  static config = {
    name: "tutien",
    aliases: [],
    version: "7.0.0",
    role: 0,
    author: "God Marcos",
    info: "Tu luyện, độ kiếp, boss, clan, pvp,... - Enhanced Version",
    Category: "Game",
    guides: "[train|dokiep|info|quest|shop|boss|phai|clan|clantop|pvp <@tag>]",
    cd: 3,
    hasPrefix: true
  };

  static realms = ["Luyện Khí", "Trúc Cơ", "Kim Đan", "Nguyên Anh", "Hóa Thần", "Luyện Hư", "Độ Kiếp", "Đại Thừa", "Phi Thăng"];
  static dataPath = path.join(__dirname, "..", "..", "system", "data", "tutien.json");
  static bossPath = path.join(__dirname, "..", "..", "system", "data", "boss.json");
  static clanPath = path.join(__dirname, "..", "..", "system", "data", "clans.json");

  static factions = {
    tien: "🧘 Tu Tiên",
    ma: "😈 Tu Ma",
    phat: "🪷 Tu Phật",
    hachan: "❄️ Hắc Hàn"
  };

  static clanRoles = {
    leader: "🏆 Bang Chủ",
    elder: "⭐ Trưởng Lão", 
    member: "� Bang Chúng"
  };

  static items = {
    ngoc: { name: "💠 Ngọc May Mắn", price: 2, effect: "+20% tỉ lệ độ kiếp" },
    danexp: { name: "💊 Đan EXP", price: 2, effect: "+1000 EXP" },
    danphuc: { name: "🧪 Đan Hồi Phục", price: 3, effect: "Bảo vệ khi độ kiếp fail" },
    thechat: { name: "💼 Gói Thể Chất", price: 1, effect: "+10~20 Thể Chất" },
    petbox: { name: "🎁 Rương Pet", price: 5, effect: "Mở ra 1 pet ngẫu nhiên" },
    clantoken: { name: "🏯 Clan Token", price: 10, effect: "Để tạo clan mới" }
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

  static getClanData() {
    try {
      if (!fs.existsSync(this.clanPath)) return {};
      return JSON.parse(fs.readFileSync(this.clanPath));
    } catch (e) {
      console.error("[tutien] Lỗi đọc clan data:", e);
      return {};
    }
  }

  static saveClanData(data) {
    try {
      fs.writeFileSync(this.clanPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("[tutien] Lỗi lưu clan data:", e);
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
    if (!fs.existsSync(this.clanPath)) fs.writeFileSync(this.clanPath, "{}");
    if (!fs.existsSync(this.bossPath)) {
      const boss = this.createNewBoss();
      this.saveBossData(boss);
    }
  }

  static async onRun({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const data = this.getAllData();
    const clanData = this.getClanData();
    const fbName = (await api.getUserInfo(senderID))[senderID].name;

    if (!data[senderID]) {
      data[senderID] = {
        name: fbName,
        exp: 0,
        linhThach: 0,
        realm: "Luyện Khí",
        theChat: Math.floor(Math.random() * 101) + 50,
        items: {},
        faction: null,
        lastTrain: 0,
        pvpCooldown: 0,
        clan: null,
        clanRole: null,
        dokiepCount: 0,
        pvpWins: 0,
        trainCount: 0,
        bossDamage: 0,
        hideInfo: false,
        petInventory: [],
        petEquipped: null,
        contribution: 0,
        joinTime: 0
      };
    }

    const user = data[senderID];
    user.name = fbName;
    const cmd = args[0]?.toLowerCase();

    if (!cmd) {
      const msg = `📜 𝗧𝗨 𝗧𝗜Ê𝗡 𝗠𝗘𝗡𝗨 𝗩𝟳.𝟬\n━━━━━━━━━━━━\n` +
        `🌱 Tu luyện: train | dokiep | quest | dungeon | info\n` +
        `🎮 Khác: pvp <@tag> | boss | phai\n` +
        `🏯 Bang hội: clan | clantop | claninfo | clanleave\n` +
        `🛍️ Vật phẩm: shop | buy <mã> | use <mã> | inv\n` +
        `⚙️ Hệ thống: top | hide | pet`;
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== TRAIN COMMAND ==========
    if (cmd === "train") {
      const now = Date.now();
      const cd = 180000; // 3 phút
      if (now - user.lastTrain < cd) {
        const left = Math.ceil((cd - (now - user.lastTrain)) / 1000);
        return api.sendMessage(`⏱️ Còn ${left}s mới có thể train tiếp.`, threadID, messageID);
      }

      let exp = Math.floor(Math.random() * 201) + 100;
      if (user.faction === "hachan" && user.theChat > 100) exp += 50;
      if (user.clan) exp += 25; // Clan bonus
      
      user.exp += exp;
      user.trainCount++;
      user.linhThach += Math.random() < 0.3 ? 1 : 0;
      user.lastTrain = now;

      if (user.dailyQuest?.type === "train" && user.dailyQuest.date === new Date().toDateString()) {
        user.dailyQuest.progress++;
      }

      this.saveAllData(data);
      let msg = `🧘 Tu luyện thành công! Nhận ${exp} EXP`;
      if (user.clan) msg += ` (+25 EXP từ clan)`;
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== DOKIEP COMMAND ==========
    if (cmd === "dokiep") {
      const index = this.realms.indexOf(user.realm);
      if (index >= this.realms.length - 1) return api.sendMessage("🚫 Đã đạt cảnh giới tối đa.", threadID, messageID);
      
      const next = this.realms[index + 1];
      const reqExp = (index + 1) * 1500;
      if (user.exp < reqExp) return api.sendMessage(`⚠️ Cần ${reqExp} EXP để độ kiếp.`, threadID, messageID);
      if (user.theChat < 50) return api.sendMessage("❌ Thể chất không đủ (cần ít nhất 50).", threadID, messageID);
      
      let rate = 0.6;
      if (user.faction === "ma") rate += 0.1;
      if (user.clan) rate += 0.05; // Clan bonus
      if (user.items.ngoc) {
        user.items.ngoc--;
        if (user.items.ngoc <= 0) delete user.items.ngoc;
        rate += 0.2;
      }

      const roll = Math.random();
      if (roll < 0.05) { // Đột phá thần tốc 5%
        user.realm = this.realms[Math.min(index + 2, this.realms.length - 1)];
        user.exp -= reqExp;
        user.dokiepCount++;
        user.contribution += 10;
        this.saveAllData(data);
        return api.sendMessage(`⚡️ ĐỘT PHÁ THẦN TỐC lên ${user.realm}!`, threadID, messageID);
      }

      if (roll < rate) {
        user.realm = next;
        user.exp -= reqExp;
        user.dokiepCount++;
        user.linhThach += 2;
        user.contribution += 5;
        this.saveAllData(data);
        return api.sendMessage(`🌟 Độ kiếp thành công! Cảnh giới mới: ${next}`, threadID, messageID);
      } else {
        if (user.items.danphuc) {
          user.items.danphuc--;
          if (user.items.danphuc <= 0) delete user.items.danphuc;
          this.saveAllData(data);
          return api.sendMessage("🛡️ Được bảo vệ bởi Đan Hồi Phục. Không mất EXP.", threadID, messageID);
        }
        if (Math.random() < 0.3) {
          user.realm = this.realms[Math.max(0, index - 1)];
          user.theChat -= 10;
          this.saveAllData(data);
          return api.sendMessage("💥 Tẩu hỏa nhập ma! Bị giảm cảnh giới và thể chất!", threadID, messageID);
        }
        user.exp -= reqExp;
        this.saveAllData(data);
        return api.sendMessage("💥 Độ kiếp thất bại!", threadID, messageID);
      }
    }

    // ========== INFO COMMAND ==========
    if (cmd === "info") {
      if (user.hideInfo) return api.sendMessage("🔒 Người này đang ẩn thông tin tu luyện.", threadID, messageID);
      
      let msg = `👤 ${user.name}\n🌟 Cảnh giới: ${user.realm}\n✨ EXP: ${user.exp.toLocaleString()}\n💎 Linh Thạch: ${user.linhThach}\n💪 Thể chất: ${user.theChat}\n☯️ Phái: ${this.factions[user.faction] || "Chưa chọn"}`;
      
      if (user.clan) {
        const clan = clanData[user.clan];
        msg += `\n🏯 Bang: ${user.clan}\n👑 Chức vụ: ${this.clanRoles[user.clanRole] || "Member"}\n🎯 Cống hiến: ${user.contribution}`;
      }
      
      if (user.petEquipped) msg += `\n🐾 Pet: ${user.petEquipped}`;
      msg += `\n📊 Thống kê: ${user.dokiepCount} độ kiếp | ${user.pvpWins} pvp thắng | ${user.trainCount} lần train`;
      
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== PHAI COMMAND ==========
    if (cmd === "phai") {
      if (user.faction) return api.sendMessage("☯️ Bạn đã chọn phái, không thể thay đổi.", threadID, messageID);
      
      const pick = args[1]?.toLowerCase();
      if (!["tien", "ma", "phat", "hachan"].includes(pick))
        return api.sendMessage("☯️ Dùng: phai tien | ma | phat | hachan\n🧘 Tu Tiên: Cân bằng\n😈 Tu Ma: +10% độ kiếp\n🪷 Tu Phật: Hồi phục nhanh\n❄️ Hắc Hàn: +EXP khi thể chất cao", threadID, messageID);
      
      user.faction = pick;
      this.saveAllData(data);
      return api.sendMessage(`☯️ Bạn đã gia nhập ${this.factions[pick]}`, threadID, messageID);
    }

    // ========== SHOP COMMAND ==========
    if (cmd === "shop") {
      let msg = "🛒 Shop Tu Tiên:\n━━━━━━━━━━━━\n";
      for (const [code, item] of Object.entries(this.items)) {
        msg += `📦 ${code}: ${item.name} (${item.price} LT)\n   └ ${item.effect}\n\n`;
      }
      msg += "💡 Dùng: buy <mã> để mua";
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    // ========== BUY COMMAND ==========
    if (cmd === "buy") {
      const code = args[1];
      if (!this.items[code]) return api.sendMessage("❌ Mã vật phẩm không hợp lệ. Gõ `shop` để xem.", threadID, messageID);
      
      const item = this.items[code];
      if (user.linhThach < item.price) return api.sendMessage(`❌ Không đủ Linh Thạch. Cần ${item.price} LT.`, threadID, messageID);
      
      user.linhThach -= item.price;
      user.items[code] = (user.items[code] || 0) + 1;
      this.saveAllData(data);
      return api.sendMessage(`✅ Đã mua 1 ${item.name}`, threadID, messageID);
    }

    // ========== USE COMMAND ==========
    if (cmd === "use") {
      const code = args[1];
      if (!this.items[code] || !user.items[code]) return api.sendMessage("❌ Bạn không có vật phẩm này.", threadID, messageID);
      
      user.items[code]--;
      if (user.items[code] <= 0) delete user.items[code];
      
      if (code === "danexp") {
        user.exp += 1000;
        this.saveAllData(data);
        return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}\n✨ Nhận 1000 EXP`, threadID, messageID);
      }
      
      if (code === "thechat") {
        const gain = Math.floor(Math.random() * 11) + 10;
        user.theChat += gain;
        this.saveAllData(data);
        return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}\n💪 Nhận ${gain} Thể Chất`, threadID, messageID);
      }
      
      if (code === "petbox") {
        const pet = this.petList[Math.floor(Math.random() * this.petList.length)];
        user.petInventory.push(pet);
        this.saveAllData(data);
        return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}\n🐾 Bạn nhận được: ${pet}`, threadID, messageID);
      }

      if (code === "clantoken") {
        this.saveAllData(data);
        return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}\n🏯 Dùng lệnh: clan create <tên clan> để tạo clan`, threadID, messageID);
      }
      
      this.saveAllData(data);
      return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}`, threadID, messageID);
    }

    // ========== INV COMMAND ==========
    if (cmd === "inv") {
      const inv = user.items || {};
      if (!Object.keys(inv).length) return api.sendMessage("🎒 Kho đồ trống.", threadID, messageID);
      
      let msg = "🎒 Kho đồ:\n━━━━━━━━━━━━\n";
      for (const [code, count] of Object.entries(inv)) {
        msg += `📦 ${this.items[code]?.name || code}: ${count}\n`;
      }
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    // ========== PET COMMANDS ==========
    if (cmd === "pet") {
      const sub = args[1];
      if (!sub) {
        return api.sendMessage(user.petEquipped ? `🐾 Pet hiện tại: ${user.petEquipped}` : "🐾 Bạn chưa có pet, hãy dùng `use petbox` để mở!", threadID, messageID);
      }
      
      if (sub === "inv") {
        if (!user.petInventory || user.petInventory.length === 0)
          return api.sendMessage("🎒 Bạn chưa có pet nào trong kho!", threadID, messageID);
        const list = user.petInventory.map((p, i) => `${i + 1}. ${p}`).join("\n");
        return api.sendMessage(`🎒 Pet trong kho:\n━━━━━━━━━━━━\n${list}`, threadID, messageID);
      }
      
      if (sub === "equip") {
        const name = args.slice(2).join(" ");
        if (!name) return api.sendMessage("❌ Dùng: pet equip <tên pet>", threadID, messageID);
        if (!user.petInventory.includes(name))
          return api.sendMessage("❌ Bạn không sở hữu pet này.", threadID, messageID);
        user.petEquipped = name;
        this.saveAllData(data);
        return api.sendMessage(`✅ Đã trang bị pet: ${name}`, threadID, messageID);
      }
    }

    // ========== PVP COMMAND ==========
    if (cmd === "pvp") {
      const now = Date.now();
      if (now - user.pvpCooldown < 300000) {
        const left = Math.ceil((300000 - (now - user.pvpCooldown)) / 1000);
        return api.sendMessage(`⏱️ Chờ ${left}s để thách đấu tiếp.`, threadID, messageID);
      }

      const targetID = Object.keys(event.mentions)[0];
      if (!targetID) return api.sendMessage("❌ Vui lòng tag đối thủ!", threadID, messageID);
      if (targetID === senderID) return api.sendMessage("❌ Không thể tự đánh bản thân!", threadID, messageID);

      const target = data[targetID];
      if (!target) return api.sendMessage("❌ Đối thủ chưa tu tiên!", threadID, messageID);

      const userPower = this.realms.indexOf(user.realm) * 100 + user.theChat;
      const targetPower = this.realms.indexOf(target.realm) * 100 + target.theChat;

      const userRoll = Math.random() * 50;
      const targetRoll = Math.random() * 50;

      const userTotal = userPower + userRoll;
      const targetTotal = targetPower + targetRoll;

      let resultMsg = "", expGain = 0;
      if (userTotal > targetTotal) {
        expGain = Math.floor(targetPower / 2);
        resultMsg = `⚔️ Bạn đã đánh bại ${target.name}!\n✨ Nhận ${expGain} EXP + 1 Linh Thạch`;
        user.exp += expGain;
        user.pvpWins++;
        user.linhThach += 1;
        user.contribution += 2;
        target.theChat = Math.max(10, target.theChat - 5);
      } else if (userTotal < targetTotal) {
        expGain = Math.floor(userPower / 4);
        resultMsg = `💥 Bạn bị ${target.name} đánh bại!\n✨ Nhận ${expGain} EXP từ chiến bại`;
        user.exp += expGain;
        user.theChat = Math.max(10, user.theChat - 5);
      } else {
        expGain = Math.floor(userPower / 3);
        resultMsg = `🤝 Hòa với ${target.name}!\n✨ Cả hai nhận ${expGain} EXP`;
        user.exp += expGain;
        target.exp += expGain;
      }

      user.pvpCooldown = now;
      this.saveAllData(data);
      return api.sendMessage(resultMsg, threadID, messageID);
    }

    // ========== QUEST COMMAND ==========
    if (cmd === "quest") {
      const today = new Date().toDateString();
      if (!user.dailyQuest || user.dailyQuest.date !== today) {
        const types = ["train", "dokiep", "boss"];
        const rand = types[Math.floor(Math.random() * types.length)];
        const target = rand === "boss" ? 1 : 3;
        user.dailyQuest = { type: rand, progress: 0, target, date: today };
      }

      const q = user.dailyQuest;
      q.progress = q.progress || 0;
      q.target = q.target || 1;
      const done = q.progress >= q.target;
      const percent = Math.floor((q.progress / q.target) * 100);

      let msg = `🎯 Nhiệm vụ hôm nay: ${q.type.toUpperCase()}\n📊 Tiến độ: ${q.progress}/${q.target} (${percent}%)`;
      if (done) {
        user.linhThach += 2;
        user.exp += 500;
        user.contribution += 3;
        msg += `\n✅ Đã hoàn thành! +500 EXP +2 LT +3 cống hiến`;
        delete user.dailyQuest;
      }

      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== DUNGEON COMMAND ==========
    if (cmd === "dungeon") {
      const list = [
        { name: "Hang Nhện", level: 1, reward: 300 },
        { name: "Lâu Đài Bóng Tối", level: 2, reward: 600 },
        { name: "Động Băng Huyết", level: 3, reward: 1000 },
      ];
      const pick = list[Math.floor(Math.random() * list.length)];
      const pass = Math.random() < (user.clan ? 0.65 : 0.6); // Clan bonus
      
      let msg = `🏰 Dungeon: ${pick.name}\n🔥 Độ khó: ${"⭐".repeat(pick.level)}`;
      if (pass) {
        user.exp += pick.reward;
        user.contribution += pick.level;
        msg += `\n✅ Thành công! Nhận ${pick.reward} EXP`;
        if (user.clan) msg += ` (+5% từ clan)`;
      } else {
        user.theChat -= 10;
        msg += `\n💀 Thất bại! Mất 10 thể chất`;
      }
      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== TOP COMMAND ==========
    if (cmd === "top") {
      const top = Object.values(data)
        .filter(u => !u.hideInfo)
        .sort((a, b) => b.exp - a.exp)
        .slice(0, 10);
      
      let msg = "🏆 Top Tu Tiên:\n━━━━━━━━━━━━\n";
      top.forEach((u, i) => {
        const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        msg += `${icon} ${u.name}\n   🌟 ${u.realm} | ✨ ${u.exp.toLocaleString()} EXP\n\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== HIDE COMMAND ==========
    if (cmd === "hide") {
      user.hideInfo = !user.hideInfo;
      this.saveAllData(data);
      return api.sendMessage(user.hideInfo ? "🔒 Đã bật ẩn thông tin." : "🔓 Đã tắt ẩn thông tin.", threadID, messageID);
    }

    // ========== BOSS COMMAND ==========
    if (cmd === "boss") {
      const boss = this.getBossData();
      if (!boss) return api.sendMessage("⚠️ Lỗi tải boss!", threadID, messageID);
      if (boss.defeated) return api.sendMessage("🐉 Boss đã bị tiêu diệt! Chờ boss mới vào ngày mai...", threadID, messageID);

      const dmg = Math.floor(Math.random() * 201) + 100;
      boss.hp -= dmg;
      boss.damage[senderID] = (boss.damage[senderID] || 0) + dmg;
      user.bossDamage += dmg;

      let msg = `🐲 Bạn đánh ${boss.name} gây ${dmg} sát thương!\n❤️ Boss còn ${Math.max(0, boss.hp).toLocaleString()} HP`;

      if (boss.hp <= 0) {
        boss.defeated = true;
        boss.defeatTime = Date.now();
        const sorted = Object.entries(boss.damage).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 5);
        
        for (const [uid, val] of sorted) {
          if (!data[uid]) continue;
          data[uid].exp += val;
          data[uid].linhThach += 2;
          data[uid].contribution += 5;
        }
        
        msg += `\n\n🏆 ${boss.name} bị tiêu diệt!\n━━━━━━━━━━━━\nTop sát thương:\n`;
        top.forEach(([uid, dmg], i) => {
          const name = data[uid]?.hideInfo ? `Ẩn danh` : (data[uid]?.name || "Ẩn");
          const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          msg += `${icon} ${name} - ${dmg.toLocaleString()} dmg\n`;
        });
        msg += `\n🎁 Mọi người nhận EXP = sát thương + 2 LT + 5 cống hiến`;
      }

      this.saveBossData(boss);
      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    // ========== CLAN COMMANDS ==========
    if (cmd === "clan") {
      const sub = args[1]?.toLowerCase();
      
      if (!sub) {
        if (!user.clan) {
          return api.sendMessage("🏯 CLAN SYSTEM\n━━━━━━━━━━━━\n📋 clan info - Xem thông tin clan\n🏗️ clan create <tên> - Tạo clan (cần Clan Token)\n🚪 clan join <tên> - Tham gia clan\n🚶 clan leave - Rời clan\n👑 clan promote <@tag> - Thăng chức (Leader only)\n📊 clantop - Xem top clan", threadID, messageID);
        } else {
          const clan = clanData[user.clan];
          if (!clan) return api.sendMessage("❌ Lỗi: Clan không tồn tại!", threadID, messageID);
          
          let msg = `🏯 CLAN: ${user.clan}\n━━━━━━━━━━━━\n`;
          msg += `👑 Leader: ${clan.leader}\n`;
          msg += `👥 Thành viên: ${Object.keys(clan.members).length}/${clan.maxMembers}\n`;
          msg += `🎯 Tổng cống hiến: ${clan.totalContribution}\n`;
          msg += `📅 Thành lập: ${new Date(clan.createTime).toLocaleDateString()}\n\n`;
          msg += `👤 Bạn: ${this.clanRoles[user.clanRole]} | 🎯 ${user.contribution} cống hiến`;
          
          return api.sendMessage(msg, threadID, messageID);
        }
      }

      if (sub === "create") {
        if (user.clan) return api.sendMessage("❌ Bạn đã có clan!", threadID, messageID);
        if (!user.items.clantoken) return api.sendMessage("❌ Cần Clan Token để tạo clan! (mua ở shop)", threadID, messageID);
        
        const clanName = args.slice(2).join(" ");
        if (!clanName) return api.sendMessage("❌ Nhập tên clan!", threadID, messageID);
        if (clanName.length > 20) return api.sendMessage("❌ Tên clan tối đa 20 ký tự!", threadID, messageID);
        if (clanData[clanName]) return api.sendMessage("❌ Tên clan đã tồn tại!", threadID, messageID);

        // Tạo clan mới
        user.items.clantoken--;
        if (user.items.clantoken <= 0) delete user.items.clantoken;
        
        clanData[clanName] = {
          leader: user.name,
          leaderID: senderID,
          members: { [senderID]: { name: user.name, role: "leader", joinTime: Date.now(), contribution: 0 } },
          totalContribution: 0,
          createTime: Date.now(),
          maxMembers: 20,
          level: 1
        };
        
        user.clan = clanName;
        user.clanRole = "leader";
        user.joinTime = Date.now();
        
        this.saveClanData(clanData);
        this.saveAllData(data);
        return api.sendMessage(`🏯 Tạo clan "${clanName}" thành công!\n👑 Bạn là Bang Chủ`, threadID, messageID);
      }

      if (sub === "join") {
        if (user.clan) return api.sendMessage("❌ Bạn đã có clan! Dùng `clan leave` để rời clan hiện tại.", threadID, messageID);
        
        const clanName = args.slice(2).join(" ");
        if (!clanName) return api.sendMessage("❌ Nhập tên clan!", threadID, messageID);
        
        const clan = clanData[clanName];
        if (!clan) return api.sendMessage("❌ Clan không tồn tại!", threadID, messageID);
        if (Object.keys(clan.members).length >= clan.maxMembers) return api.sendMessage("❌ Clan đã đầy!", threadID, messageID);
        
        clan.members[senderID] = { name: user.name, role: "member", joinTime: Date.now(), contribution: 0 };
        user.clan = clanName;
        user.clanRole = "member";
        user.joinTime = Date.now();
        
        this.saveClanData(clanData);
        this.saveAllData(data);
        return api.sendMessage(`🏯 Gia nhập clan "${clanName}" thành công!`, threadID, messageID);
      }

      if (sub === "leave") {
        if (!user.clan) return api.sendMessage("❌ Bạn chưa có clan!", threadID, messageID);
        
        const clan = clanData[user.clan];
        if (user.clanRole === "leader") {
          delete clanData[user.clan];
          // Thông báo cho tất cả thành viên
          for (const memberID of Object.keys(clan.members)) {
            if (data[memberID]) {
              data[memberID].clan = null;
              data[memberID].clanRole = null;
            }
          }
          this.saveClanData(clanData);
          this.saveAllData(data);
          return api.sendMessage("🏯 Đã giải tán clan!", threadID, messageID);
        } else {
          delete clan.members[senderID];
          user.clan = null;
          user.clanRole = null;
          this.saveClanData(clanData);
          this.saveAllData(data);
          return api.sendMessage("🚶 Đã rời clan!", threadID, messageID);
        }
      }

      if (sub === "promote") {
        if (!user.clan || user.clanRole !== "leader") return api.sendMessage("❌ Chỉ Bang Chủ mới có thể thăng chức!", threadID, messageID);
        
        const targetID = Object.keys(event.mentions)[0];
        if (!targetID) return api.sendMessage("❌ Vui lòng tag người cần thăng chức!", threadID, messageID);
        
        const target = data[targetID];
        if (!target || target.clan !== user.clan) return api.sendMessage("❌ Người này không trong clan!", threadID, messageID);
        
        const clan = clanData[user.clan];
        if (target.clanRole === "elder") return api.sendMessage("❌ Người này đã là Trưởng Lão!", threadID, messageID);
        
        clan.members[targetID].role = "elder";
        target.clanRole = "elder";
        
        this.saveClanData(clanData);
        this.saveAllData(data);
        return api.sendMessage(`👑 Đã thăng ${target.name} lên Trưởng Lão!`, threadID, messageID);
      }

      if (sub === "info") {
        const clanName = args.slice(2).join(" ") || user.clan;
        if (!clanName) return api.sendMessage("❌ Nhập tên clan hoặc gia nhập clan trước!", threadID, messageID);
        
        const clan = clanData[clanName];
        if (!clan) return api.sendMessage("❌ Clan không tồn tại!", threadID, messageID);
        
        const members = Object.values(clan.members).sort((a, b) => b.contribution - a.contribution);
        let msg = `🏯 CLAN: ${clanName}\n━━━━━━━━━━━━\n`;
        msg += `👑 Bang Chủ: ${clan.leader}\n`;
        msg += `👥 Thành viên: ${members.length}/${clan.maxMembers}\n`;
        msg += `🎯 Tổng cống hiến: ${clan.totalContribution}\n`;
        msg += `📅 Thành lập: ${new Date(clan.createTime).toLocaleDateString()}\n\n`;
        msg += `👥 Top thành viên:\n`;
        
        members.slice(0, 5).forEach((member, i) => {
          const icon = member.role === "leader" ? "👑" : member.role === "elder" ? "⭐" : "👤";
          msg += `${i + 1}. ${icon} ${member.name} (${member.contribution} cống hiến)\n`;
        });
        
        return api.sendMessage(msg, threadID, messageID);
      }
    }

    // ========== CLANTOP COMMAND ==========
    if (cmd === "clantop") {
      const clans = Object.entries(clanData)
        .map(([name, clan]) => ({ name, ...clan }))
        .sort((a, b) => b.totalContribution - a.totalContribution)
        .slice(0, 10);
      
      if (clans.length === 0) return api.sendMessage("📊 Chưa có clan nào!", threadID, messageID);
      
      let msg = "🏆 TOP CLAN\n━━━━━━━━━━━━\n";
      clans.forEach((clan, i) => {
        const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        msg += `${icon} ${clan.name}\n`;
        msg += `   👑 ${clan.leader} | 👥 ${Object.keys(clan.members).length} thành viên\n`;
        msg += `   🎯 ${clan.totalContribution} tổng cống hiến\n\n`;
      });
      
      return api.sendMessage(msg, threadID, messageID);
    }

    return api.sendMessage("❓ Lệnh không hợp lệ. Gõ `.tutien` để xem menu.", threadID, messageID);
  }

  static async onEvent({ event }) {
    const data = this.getAllData();
    const user = data[event.senderID];
    if (!user) return;
    
    // Random EXP khi chat
    const gain = Math.floor(Math.random() * 3) + 1;
    user.exp += gain;
    
    // Cập nhật contribution cho clan
    if (user.clan) {
      user.contribution += Math.random() < 0.1 ? 1 : 0;
      const clanData = this.getClanData();
      const clan = clanData[user.clan];
      if (clan && clan.members[event.senderID]) {
        clan.members[event.senderID].contribution = user.contribution;
        clan.totalContribution = Object.values(clan.members).reduce((sum, member) => sum + member.contribution, 0);
        this.saveClanData(clanData);
      }
    }
    
    this.saveAllData(data);
  }

  static async onReply() {}
  static async onReaction() {}
};
