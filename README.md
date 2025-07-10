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
  // Đường dẫn file dữ liệu clan
  static clanPath = path.join(__dirname, "..", "..", "system", "data", "clan.json");

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

  // ===== CLAN DATA HELPERS ===== //
  static getAllClanData() {
    try {
      if (!fs.existsSync(this.clanPath)) return {};
      return JSON.parse(fs.readFileSync(this.clanPath));
    } catch (e) {
      console.error("[tutien] Lỗi đọc clan:", e);
      return {};
    }
  }

  static saveAllClanData(data) {
    try {
      fs.writeFileSync(this.clanPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("[tutien] Lỗi lưu clan:", e);
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

    // Tạo file clan.json nếu chưa có
    if (!fs.existsSync(this.clanPath)) fs.writeFileSync(this.clanPath, "{}");
  }
static async onRun({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const data = this.getAllData();
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
        petEquipped: null
      };
    }

    const user = data[senderID];
    user.name = fbName;
    const cmd = args[0]?.toLowerCase();

    if (!cmd) {
      const msg = `📜 𝗧𝗨 𝗧𝗜Ê𝗡 𝗠𝗘𝗡𝗨\n━━━━━━━━━━━━\n` +
        `🌱 Tu luyện: train | dokiep | quest | dungeon | info\n` +
        `🎮 Khác: pvp <@tag> | boss | phai\n` +
        `🏯 Bang: clan | clantop\n` +
        `🛍️ Vật phẩm: shop | buy <mã> | use <mã> | inv\n` +
        `⚙️ Hệ thống: top | hide | pet`;
      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "train") {
      const now = Date.now();
      const cd = 180000;
      if (now - user.lastTrain < cd) {
        const left = Math.ceil((cd - (now - user.lastTrain)) / 1000);
        return api.sendMessage(`⏱️ Còn ${left}s mới có thể train tiếp.`, threadID, messageID);
      }

      let exp = Math.floor(Math.random() * 201) + 100;
      if (user.faction === "hachan" && user.theChat > 100) exp += 50;
      user.exp += exp;
      user.trainCount++;
      user.linhThach += Math.random() < 0.3 ? 1 : 0;
      user.lastTrain = now;

      if (user.dailyQuest?.type === "train" && user.dailyQuest.date === new Date().toDateString()) {
        user.dailyQuest.progress++;
      }

      this.saveAllData(data);
      return api.sendMessage(`🧘 Bạn nhận được ${exp} EXP.`, threadID, messageID);
    }

    if (cmd === "dokiep") {
      const index = this.realms.indexOf(user.realm);
      if (index >= this.realms.length - 1) return api.sendMessage("🚫 Đã đạt cảnh giới tối đa.", threadID, messageID);
      const next = this.realms[index + 1];
      const reqExp = (index + 1) * 1500;
      if (user.exp < reqExp) return api.sendMessage(`⚠️ Cần ${reqExp} EXP để độ kiếp.`, threadID, messageID);
      if (user.theChat < 50) return api.sendMessage("❌ Thể chất không đủ.", threadID, messageID);
      let rate = 0.6;
      if (user.faction === "ma") rate += 0.1;
      if (user.items.ngoc) {
        user.items.ngoc--;
        rate += 0.2;
      }

      const roll = Math.random();
      if (roll < 0.05) {
        user.realm = this.realms[Math.min(index + 2, this.realms.length - 1)];
        user.exp -= reqExp;
        user.dokiepCount++;
        this.saveAllData(data);
        return api.sendMessage(`⚡️ ĐỘT PHÁ THẦN TỐC lên ${user.realm}!`, threadID, messageID);
      }

      if (roll < rate) {
        user.realm = next;
        user.exp -= reqExp;
        user.dokiepCount++;
        user.linhThach += 2;
        this.saveAllData(data);
        return api.sendMessage(`🌟 Độ kiếp thành công! Cảnh giới mới: ${next}`, threadID, messageID);
      } else {
        if (user.items.danphuc) {
          user.items.danphuc--;
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

    if (cmd === "info") {
      if (user.hideInfo) return api.sendMessage("🔒 Người này đang ẩn thông tin tu luyện.", threadID, messageID);
      let msg = `👤 ${user.name}\n🌟 Cảnh giới: ${user.realm}\n✨ EXP: ${user.exp}\n💎 Linh Thạch: ${user.linhThach}\n💪 Thể chất: ${user.theChat}\n☯️ Phái: ${this.factions[user.faction] || "Chưa chọn"}`;
      if (user.clan) msg += `\n🏯 Clan: ${user.clan} (${user.clanRole || "Member"})`;
      if (user.petEquipped) msg += `\n🐾 Pet: ${user.petEquipped}`;
      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "phai") {
      if (user.faction) return api.sendMessage("☯️ Bạn đã chọn phái, không thể thay đổi.", threadID, messageID);
      const pick = args[1]?.toLowerCase();
      if (!["tien", "ma", "phat", "hachan"].includes(pick))
        return api.sendMessage("☯️ Dùng: phai tien | ma | phat | hachan", threadID, messageID);
      user.faction = pick;
      this.saveAllData(data);
      return api.sendMessage(`☯️ Bạn đã gia nhập ${this.factions[pick]}`, threadID, messageID);
    }

    // ========== CLAN COMMAND ==========
    if (cmd === "clan") {
      const clans = this.getAllClanData();
      const sub = args[1]?.toLowerCase();

      // Hiển thị trợ giúp
      if (!sub) {
        const helpMsg =
          "🏯 Clan Commands:\n" +
          "- clan create <tên>: tạo clan (tốn 5 LT)\n" +
          "- clan join <tên>: tham gia clan\n" +
          "- clan leave: rời clan\n" +
          "- clan info [tên]: xem thông tin clan\n" +
          "- clantop: bảng xếp hạng clan";
        return api.sendMessage(helpMsg, threadID, messageID);
      }

      // ===== CREATE =====
      if (sub === "create") {
        if (user.clan)
          return api.sendMessage("❌ Bạn đã có clan rồi!", threadID, messageID);
        const name = args.slice(2).join(" ");
        if (!name)
          return api.sendMessage("❌ Dùng: clan create <tên>", threadID, messageID);
        if (clans[name])
          return api.sendMessage("❌ Clan này đã tồn tại!", threadID, messageID);
        if (user.linhThach < 5)
          return api.sendMessage("❌ Cần 5 LT để tạo clan!", threadID, messageID);

        // Khởi tạo clan
        clans[name] = {
          leader: senderID,
          members: [senderID]
        };
        user.linhThach -= 5;
        user.clan = name;
        user.clanRole = "Leader";
        this.saveAllClanData(clans);
        this.saveAllData(data);
        return api.sendMessage(`✅ Tạo clan ${name} thành công!`, threadID, messageID);
      }

      // ===== JOIN =====
      if (sub === "join") {
        if (user.clan) return api.sendMessage("❌ Bạn đã ở trong clan!", threadID, messageID);
        const name = args.slice(2).join(" ");
        if (!name || !clans[name])
          return api.sendMessage("❌ Clan không tồn tại!", threadID, messageID);
        if (clans[name].members.length >= 20)
          return api.sendMessage("❌ Clan đã đầy!", threadID, messageID);

        clans[name].members.push(senderID);
        user.clan = name;
        user.clanRole = "Member";
        this.saveAllClanData(clans);
        this.saveAllData(data);
        return api.sendMessage(`✅ Đã tham gia clan ${name}!`, threadID, messageID);
      }

      // ===== LEAVE =====
      if (sub === "leave") {
        if (!user.clan) return api.sendMessage("❌ Bạn chưa ở clan nào!", threadID, messageID);
        const name = user.clan;
        const clan = clans[name];
        if (!clan) {
          // dữ liệu lệch, reset
          user.clan = null;
          user.clanRole = null;
          this.saveAllData(data);
          return api.sendMessage("⚠️ Dữ liệu clan lỗi, đã reset!", threadID, messageID);
        }
        // Nếu là leader và còn thành viên khác
        if (clan.leader === senderID && clan.members.length > 1) {
          return api.sendMessage("❌ Bạn là leader, hãy chuyển quyền hoặc giải tán clan!", threadID, messageID);
        }
        // Xóa thành viên
        clan.members = clan.members.filter((id) => id !== senderID);
        if (clan.members.length === 0) {
          delete clans[name];
        } else if (clan.leader === senderID) {
          clan.leader = clan.members[0]; // chuyển leader cho thành viên đầu tiên
        }
        user.clan = null;
        user.clanRole = null;
        this.saveAllClanData(clans);
        this.saveAllData(data);
        return api.sendMessage("✅ Đã rời clan!", threadID, messageID);
      }

      // ===== INFO =====
      if (sub === "info") {
        let name = args.slice(2).join(" ");
        if (!name) name = user.clan;
        if (!name || !clans[name])
          return api.sendMessage("❌ Clan không tồn tại hoặc bạn chưa có clan!", threadID, messageID);
        const clan = clans[name];
        const memberNames = clan.members
          .map((uid, idx) => {
            const u = data[uid];
            const disp = u?.hideInfo ? "Ẩn danh" : u?.name || `UID ${uid}`;
            return `${idx + 1}. ${disp}`;
          })
          .join("\n");
        // Tính tổng EXP clan
        const totalExp = clan.members.reduce((sum, uid) => sum + (data[uid]?.exp || 0), 0);
        const infoMsg = `🏯 Clan: ${name}\n👑 Leader: ${data[clan.leader]?.name || clan.leader}\n👥 Số thành viên: ${clan.members.length}\n✨ Tổng EXP: ${totalExp}\n\nDanh sách:\n${memberNames}`;
        return api.sendMessage(infoMsg, threadID, messageID);
      }

      // Subcommand không hợp lệ
      return api.sendMessage("❓ Subcommand không hợp lệ!", threadID, messageID);
    }

    // ========== CLAN TOP ==========
    if (cmd === "clantop") {
      const clans = this.getAllClanData();
      const ranking = Object.entries(clans)
        .map(([name, clanObj]) => {
          const totalExp = clanObj.members.reduce((sum, uid) => sum + (data[uid]?.exp || 0), 0);
          return { name, totalExp };
        })
        .sort((a, b) => b.totalExp - a.totalExp)
        .slice(0, 5);
      if (!ranking.length) return api.sendMessage("🏯 Chưa có clan nào!", threadID, messageID);
      let msg = "🏆 TOP CLAN:\n";
      ranking.forEach((c, i) => {
        msg += `${i + 1}. ${c.name} – EXP: ${c.totalExp}\n`;
      });
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    if (cmd === "shop") {
      let msg = "🛒 Shop Tu Tiên:\n";
      for (const [code, item] of Object.entries(this.items)) {
        msg += `- ${code}: ${item.name} (${item.price} LT) – ${item.effect}\n`;
      }
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    if (cmd === "buy") {
      const code = args[1];
      if (!this.items[code]) return api.sendMessage("❌ Mã vật phẩm không hợp lệ.", threadID, messageID);
      const item = this.items[code];
      if (user.linhThach < item.price) return api.sendMessage("❌ Không đủ Linh Thạch.", threadID, messageID);
      user.linhThach -= item.price;
      user.items[code] = (user.items[code] || 0) + 1;
      this.saveAllData(data);
      return api.sendMessage(`✅ Đã mua 1 ${item.name}.`, threadID, messageID);
    }

    if (cmd === "use") {
      const code = args[1];
      if (!this.items[code] || !user.items[code]) return api.sendMessage("❌ Bạn không có vật phẩm này.", threadID, messageID);
      user.items[code]--;
      if (code === "danexp") user.exp += 1000;
      if (code === "thechat") user.theChat += Math.floor(Math.random() * 11) + 10;
      if (code === "petbox") {
        const pet = this.petList[Math.floor(Math.random() * this.petList.length)];
        user.petInventory.push(pet);
        this.saveAllData(data);
        return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}\n🐾 Bạn nhận được: ${pet}`, threadID, messageID);
      }
      this.saveAllData(data);
      return api.sendMessage(`🎯 Đã dùng ${this.items[code].name}`, threadID, messageID);
    }
if (cmd === "inv") {
      const inv = user.items || {};
      if (!Object.keys(inv).length) return api.sendMessage("🎒 Kho đồ trống.", threadID, messageID);
      let msg = "🎒 Kho đồ:\n";
      for (const [code, count] of Object.entries(inv)) {
        msg += `- ${this.items[code]?.name || code}: ${count}\n`;
      }
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    if (cmd === "pet") {
      const sub = args[1];
      if (!sub) {
        return api.sendMessage(user.petEquipped ? `🐾 Pet của bạn: ${user.petEquipped}` : "🐾 Bạn chưa có pet, hãy dùng `use petbox` để mở!", threadID, messageID);
      }
      if (sub === "inv") {
        if (!user.petInventory || user.petInventory.length === 0)
          return api.sendMessage("🎒 Bạn chưa có pet nào trong kho!", threadID, messageID);
        const list = user.petInventory.map((p, i) => `${i + 1}. ${p}`).join("\n");
        return api.sendMessage(`🎒 Pet trong kho:\n${list}`, threadID, messageID);
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
      if (sub === "info") {
        if (!user.petEquipped) return api.sendMessage("🐾 Bạn chưa trang bị pet nào.", threadID, messageID);
        return api.sendMessage(`📋 Pet đang dùng: ${user.petEquipped}`, threadID, messageID);
      }
    }

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
        resultMsg = `⚔️ Bạn đã đánh bại ${target.name}! Nhận ${expGain} EXP + 1 Linh Thạch.`;
        user.exp += expGain;
        user.pvpWins++;
        user.linhThach += 1;
        target.theChat = Math.max(10, target.theChat - 5);
      } else if (userTotal < targetTotal) {
        expGain = Math.floor(userPower / 4);
        resultMsg = `💥 Bạn bị ${target.name} đánh bại! Nhận ${expGain} EXP từ chiến bại.`;
        user.exp += expGain;
        user.theChat = Math.max(10, user.theChat - 5);
      } else {
        expGain = Math.floor(userPower / 3);
        resultMsg = `🤝 Hòa với ${target.name}! Cả hai nhận ${expGain} EXP.`;
        user.exp += expGain;
        target.exp += expGain;
      }

      user.pvpCooldown = now;
      this.saveAllData(data);
      return api.sendMessage(resultMsg, threadID, messageID);
    }

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

      let msg = `🎯 Nhiệm vụ hôm nay: ${q.type.toUpperCase()}\nTiến độ: ${q.progress}/${q.target} (${percent}%)`;
      if (done) {
        user.linhThach += 2;
        user.exp += 500;
        msg += `\n✅ Đã hoàn thành! +500 EXP +2 LT`;
        delete user.dailyQuest;
      }

      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "dungeon") {
      const list = [
        { name: "Hang Nhện", level: 1, reward: 300 },
        { name: "Lâu Đài Bóng Tối", level: 2, reward: 600 },
        { name: "Động Băng Huyết", level: 3, reward: 1000 },
      ];
      const pick = list[Math.floor(Math.random() * list.length)];
      const pass = Math.random() < 0.6;
      let msg = `🏰 Dungeon: ${pick.name}\n🔥 Độ khó: ${pick.level}`;
      if (pass) {
        user.exp += pick.reward;
        msg += `\n✅ Thành công! Nhận ${pick.reward} EXP.`;
      } else {
        user.theChat -= 10;
        msg += `\n💀 Thất bại! Mất 10 thể chất.`;
      }
      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "top") {
      const top = Object.values(data)
        .filter(u => !u.hideInfo)
        .sort((a, b) => b.exp - a.exp)
        .slice(0, 5);
      let msg = "🏆 Top Tu Tiên:\n";
      top.forEach((u, i) => {
        msg += `${i + 1}. ${u.name} | ${u.realm} | EXP: ${u.exp}\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "hide") {
      user.hideInfo = !user.hideInfo;
      this.saveAllData(data);
      return api.sendMessage(user.hideInfo ? "🔒 Đã bật ẩn thông tin." : "🔓 Đã tắt ẩn thông tin.", threadID, messageID);
    }

    if (cmd === "boss") {
      const boss = this.getBossData();
      if (!boss) return api.sendMessage("⚠️ Lỗi tải boss!", threadID, messageID);
      if (boss.defeated) return api.sendMessage("🐉 Boss đã bị tiêu diệt! Chờ boss mới...", threadID, messageID);

      const dmg = Math.floor(Math.random() * 201) + 100;
      boss.hp -= dmg;
      boss.damage[senderID] = (boss.damage[senderID] || 0) + dmg;
      user.bossDamage += dmg;

      let msg = `🐲 Bạn đánh boss gây ${dmg} sát thương!\nBoss còn ${Math.max(0, boss.hp)} HP.`;

      if (boss.hp <= 0) {
        boss.defeated = true;
        boss.defeatTime = Date.now();
        const sorted = Object.entries(boss.damage).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 3);
        for (const [uid, val] of sorted) {
          if (!data[uid]) continue;
          data[uid].exp += val;
          data[uid].linhThach += 1;
        }
        msg += `\n\n🏆 Boss bị tiêu diệt! Top sát thương:\n`;
        top.forEach(([uid, dmg], i) => {
          const name = data[uid]?.hideInfo ? `Ẩn danh` : (data[uid]?.name || "Ẩn");
          msg += `${i + 1}. ${name} - ${dmg} sát thương\n`;
        });
      }

      this.saveBossData(boss);
      this.saveAllData(data);
      return api.sendMessage(msg, threadID, messageID);
    }

    return api.sendMessage("❓ Lệnh không hợp lệ. Gõ `.tutien` để xem menu.", threadID, messageID);
  }
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

  static async onEvent({ event }) {
    const data = this.getAllData();
    const user = data[event.senderID];
    if (!user) return;
    const gain = Math.floor(Math.random() * 3) + 1;
    user.exp += gain;
    this.saveAllData(data);
  }

  static async onReply() {}
  static async onReaction() {}
};
