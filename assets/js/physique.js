/*!
 * physique.js — 北京“国家学生体质健康测试统测”（四、六、八年级）评分与赋分计算
 * 依据《国家学生体质健康标准（2014年修订）》，并结合北京中考体育过程性考核“体测统测赋分标准”整理。
 *
 * ⚠️ 数据来源与说明：
 *   - 各单项评分表、赋分标准来源于参考页面（图片形式），由 OCR 提取 + 人工整理。
 *   - 肺活量、50米跑、BMI、赋分标准的数值已较好核对；“坐位体前屈”部分行、
 *     以及八年级的 立定跳远 / 引体向上 / 一分钟仰卧起坐 / 1000米·800米 存在 OCR 误差，
 *     标注为估算，请以学校 / 官方发布为准，并可直接修改下方数组。
 *
 * 口径要点（参考页）：
 *   - 考核年级：四年级、六年级、八年级（每学期各 10 分，共 30 分）；另有“体育与健康知识”10 分。
 *   - 总分 = 标准分（单项得分×权重，满分100）+ 附加分（满分20）= 满分 120。
 *   - 加分指标：四/六年级=1分钟跳绳（+20）；八年级=男 引体向上+1000米、女 1分钟仰卧起坐+800米（各+10）。
 *   - 中考赋分（三类六档）：≥80→10；75~79.9→8；70~74.9→8；65~69.9→7.5；60~64.9→7；<60→5.5。
 */
(function (global) {
  'use strict';

  var SCORES = [100, 95, 90, 85, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 50, 40, 30, 20, 10];
  var GIDX = { 4: 0, 6: 1, 8: 2 };

  // 项目元数据
  var ITEMS = {
    bmi:      { name: '体重指数(BMI)',   unit: '',     dir: 'special', desc: '体重(kg)÷身高(m)²' },
    vital:    { name: '肺活量',          unit: '毫升', dir: 'high',    desc: '数值越大越好' },
    sprint:   { name: '50米跑',          unit: '秒',   dir: 'low',     desc: '数值越小越好' },
    sitreach: { name: '坐位体前屈',      unit: '厘米', dir: 'high',    desc: '数值越大越好' },
    rope:     { name: '一分钟跳绳',      unit: '个',   dir: 'high',    desc: '数值越大越好，可加分' },
    situps:   { name: '一分钟仰卧起坐',  unit: '个',   dir: 'high',    desc: '数值越大越好' },
    shuttle:  { name: '50米×8往返跑',    unit: '秒',   dir: 'low',     desc: '数值越小越好' },
    standing: { name: '立定跳远',        unit: '厘米', dir: 'high',    desc: '数值越大越好' },
    pullup:   { name: '引体向上',        unit: '次',   dir: 'high',    desc: '数值越大越好，可加分' },
    run:      { name: '1000米/800米跑',  unit: '秒',   dir: 'low',     desc: '数值越小越好，可加分' }
  };

  // 各年级项目权重（%）与加分项
  var GRADES = {
    4: { weights: { bmi: 15, vital: 15, sprint: 20, sitreach: 20, rope: 20, situps: 10 },
         order: ['vital', 'sprint', 'sitreach', 'rope', 'situps'], bonus: { rope: 20 } },
    6: { weights: { bmi: 15, vital: 15, sprint: 20, sitreach: 10, rope: 10, situps: 20, shuttle: 10 },
         order: ['vital', 'sprint', 'sitreach', 'rope', 'situps', 'shuttle'], bonus: { rope: 20 } },
    8: { weights: { bmi: 15, vital: 15, sprint: 20, sitreach: 10, standing: 10, upper: 10, run: 20 },
         order: ['vital', 'sprint', 'sitreach', 'standing', 'upper', 'run'], bonus: { upper: 10, run: 10 } }
  };

  // 单项评分表（按 [四年级, 六年级, 八年级] 排列，null 表示该年级不测）
  var TABLE = {
    vital: { dir: 'high',
      male: [
        [2600,2500,2400,2150,1900,1820,1740,1660,1580,1500,1420,1340,1260,1180,1100,1030,960,890,820,750],
        [3200,3100,3000,2750,2500,2400,2300,2200,2100,2000,1900,1800,1700,1600,1500,1410,1320,1230,1140,1050],
        [3940,3820,3700,3450,3200,3080,2960,2840,2720,2600,2480,2360,2240,2120,2000,1890,1780,1670,1560,1450]],
      female: [
        [2000,1900,1800,1700,1600,1530,1460,1390,1320,1250,1180,1110,1040,970,900,880,860,840,820,800],
        [2500,2400,2300,2200,2100,2010,1920,1830,1740,1650,1560,1470,1380,1290,1200,1170,1140,1110,1080,1050],
        [2900,2850,2800,2650,2500,2400,2300,2200,2100,2000,1900,1800,1700,1600,1500,1460,1420,1380,1340,1300]] },
    sprint: { dir: 'low',
      male: [
        [8.7,8.8,8.9,9.0,9.1,9.3,9.5,9.7,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.7,11.9,12.1],
        [8.2,8.3,8.4,8.5,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.8,11.0,11.2,11.4,11.6],
        [7.5,7.6,7.7,7.8,7.9,8.1,8.3,8.5,8.7,8.9,9.1,9.3,9.5,9.7,9.9,10.1,10.3,10.5,10.7,10.9]],
      female: [
        [8.7,8.8,8.9,9.2,9.5,9.7,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.7,11.9,12.1,12.3,12.5],
        [8.2,8.3,8.4,8.7,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.8,11.0,11.2,11.4,11.6,11.8,12.0],
        [8.0,8.1,8.2,8.5,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.8,11.0,11.2,11.4,11.6,11.8]] },
    sitreach: { dir: 'high',
      male: [
        [16.4,15.0,13.6,11.7,10.8,8.6,7.4,6.2,5.0,3.8,2.6,1.4,0.2,-1.0,-2.2,-3.2,-4.2,-5.2,-6.2,-7.2],
        [16.6,15.3,14.0,11.5,9.0,7.7,6.4,5.1,3.8,2.5,1.2,-0.1,-1.4,-2.7,-4.0,-5.0,-6.0,-7.0,-8.0,-9.0],
        [19.6,17.7,15.8,13.7,11.6,10.3,9.0,7.7,6.4,5.1,3.8,2.5,1.2,-0.1,-1.4,-2.6,-3.8,-5.0,-6.2,-7.4]],
      female: [
        [19.5,18.1,16.9,15.0,13.1,12.0,10.9,9.8,8.7,7.6,6.5,5.4,4.3,3.2,2.1,1.3,0.5,-0.3,-1.9,-2.9],
        [19.9,18.7,17.5,15.2,12.9,11.8,10.7,9.6,8.5,7.4,6.3,5.2,4.1,3.0,1.9,1.1,0.3,-0.5,-1.3,-2.1],
        [22.7,21.0,19.3,17.6,15.9,14.6,13.3,12.0,10.7,9.4,8.1,6.8,5.5,4.2,2.9,2.1,1.3,0.5,-0.3,-1.1]] },
    rope: { dir: 'high',
      male: [
        [137,130,123,116,109,101,94,87,80,73,66,59,52,45,38,35,32,29,26,23],
        [157,151,145,138,131,123,115,107,99,91,83,75,67,59,51,47,43,39,35,31], null],
      female: [
        [145,138,131,124,117,109,101,93,85,77,69,61,53,45,37,34,31,28,25,22],
        [165,158,151,144,137,129,121,113,105,97,89,81,73,65,57,54,51,48,45,42], null] },
    situps: { dir: 'high',
      male: [
        [48,44,40,36,32,30,28,26,24,22,20,18,16,14,12,11,10,9,8,7],
        [51,47,43,39,35,33,31,29,27,25,23,21,19,17,15,14,13,12,11,10], null],
      female: [
        [46,42,38,34,30,28,26,24,22,20,18,16,14,12,10,9,8,7,6,5],
        [49,45,41,37,33,31,29,27,25,23,21,19,17,15,13,12,11,10,9,8],
        [52,49,46,43,40,38,36,34,32,30,28,26,24,22,20,18,16,14,12,10]] },
    shuttle: { dir: 'low',
      male:   [null, [90,93,96,99,102,104,106,108,110,112,114,116,118,120,122,126,130,134,138,142], null],
      female: [null, [93,96,99,102,105,107,109,111,113,115,117,119,121,123,125,129,133,137,141,145], null] },
    standing: { dir: 'high',
      male:   [null, null, [240,233,226,218,210,206,202,198,194,190,186,182,178,174,170,165,160,155,150,145]],
      female: [null, null, [200,194,188,181,174,171,168,165,162,159,156,153,150,147,144,139,134,129,124,119]] },
    pullup: { dir: 'high',
      male:   [null, null, [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0]],
      female: [null, null, null] },
    run: { dir: 'low',
      male:   [null, null, [225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,310,325,340,355,370]], // 1000米(秒)
      female: [null, null, [215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,300,315,330,345,360]] } // 800米(秒)
  };

  // BMI 分类边界
  var BMI = {
    male:   [{ lo: 14.2, hi: 20.1, ob: 22.6 }, { lo: 14.7, hi: 21.8, ob: 24.5 }, { lo: 15.7, hi: 22.5, ob: 25.2 }],
    female: [{ lo: 13.7, hi: 19.4, ob: 22.0 }, { lo: 14.2, hi: 20.8, ob: 23.6 }, { lo: 15.3, hi: 22.2, ob: 24.8 }]
  };

  // 中考赋分（三类六档）
  var HONOR = [
    { min: 80,   score: 10,  label: '良好及以上' },
    { min: 75,   score: 8,   label: '及格' },
    { min: 70,   score: 8,   label: '及格' },
    { min: 65,   score: 7.5, label: '及格' },
    { min: 60,   score: 7,   label: '及格' },
    { min: -1e9, score: 5.5, label: '不及格' }
  ];

  function tbl(item, sex) { return TABLE[item] ? TABLE[item][sex === 'male' ? 'male' : 'female'] : null; }
  function rowOf(item, sex, grade) {
    var t = tbl(item, sex); if (!t) return null;
    return t[GIDX[grade]] || null;
  }

  function calcBMI(h, w) { if (!h || !w) return null; var m = h / 100; return w / (m * m); }

  function bmiScore(sex, grade, bmi) {
    if (bmi == null || isNaN(bmi)) return null;
    var b = BMI[sex === 'male' ? 'male' : 'female'][GIDX[grade]]; if (!b) return null;
    if (bmi < b.lo) return 80;   // 低体重
    if (bmi <= b.hi) return 100; // 正常
    if (bmi <= b.ob) return 80;  // 超重
    return 60;                    // 肥胖
  }
  function bmiCategory(sex, grade, bmi) {
    if (bmi == null || isNaN(bmi)) return '';
    var b = BMI[sex === 'male' ? 'male' : 'female'][GIDX[grade]]; if (!b) return '';
    if (bmi < b.lo) return '低体重';
    if (bmi <= b.hi) return '正常';
    if (bmi <= b.ob) return '超重';
    return '肥胖';
  }

  // 单项目标项目键（八：upper→引体向上/仰卧起坐，run→1000/800米）
  function realItem(item, sex) {
    if (item === 'upper') return sex === 'male' ? 'pullup' : 'situps';
    return item;
  }
  function itemMeta(item, sex) {
    var it = ITEMS[item] || ITEMS[realItem(item, sex)];
    if (item === 'upper') return { name: sex === 'male' ? '引体向上' : '一分钟仰卧起坐', unit: sex === 'male' ? '次' : '个', dir: 'high', desc: '数值越大越好，可加分' };
    if (item === 'run') return { name: sex === 'male' ? '1000米跑' : '800米跑', unit: '分·秒', dir: 'low', desc: '数值越小越好，可加分' };
    return it;
  }

  function itemScore(item, sex, grade, value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) return null;
    if (item === 'bmi') return bmiScore(sex, grade, value);
    var it = realItem(item, sex);
    var row = rowOf(it, sex, grade); if (!row) return null;
    var dir = TABLE[it].dir;
    for (var i = 0; i < SCORES.length; i++) {
      if (dir === 'high') { if (value >= row[i]) return SCORES[i]; }
      else { if (value <= row[i]) return SCORES[i]; }
    }
    return 0;
  }

  // 加分
  function bonusOf(item, sex, grade, value, single) {
    if (single == null || single < 100) return 0;
    var bonus = 0;
    if (item === 'rope') {            // 四/六：跳绳，超过100分每多2个+1，上限20
      var r = rowOf('rope', sex, grade); if (!r) return 0;
      bonus = Math.floor((value - r[0]) / 2);
      return Math.max(0, Math.min(20, bonus));
    }
    if (item === 'upper') {           // 八：引体向上(男)/仰卧起坐(女)，超过100分每个+1，上限10
      var u = rowOf(realItem('upper', sex), sex, grade); if (!u) return 0;
      bonus = Math.floor(value - u[0]);
      return Math.max(0, Math.min(10, bonus));
    }
    if (item === 'run') {             // 八：1000/800米，低优，每少5秒+1，上限10
      var q = rowOf('run', sex, grade); if (!q) return 0;
      bonus = Math.floor((q[0] - value) / 5);
      return Math.max(0, Math.min(10, bonus));
    }
    return 0;
  }

  function levelOf(s) { if (s >= 90) return '优秀'; if (s >= 80) return '良好'; if (s >= 60) return '及格'; return '不及格'; }

  function honorScore(total) {
    for (var i = 0; i < HONOR.length; i++) if (total >= HONOR[i].min) return HONOR[i].score;
    return 5.5;
  }

  function calculate(input) {
    var grade = input.grade, sex = input.sex;
    var g = GRADES[grade]; if (!g) return null;
    var values = input.values || {};
    var bmiValue = calcBMI(input.height, input.weight);
    var rows = [], total = 0, bonusSum = 0;

    ['bmi'].concat(g.order).forEach(function (item) {
      var key = item, meta, value, score, category = '';
      if (item === 'bmi') {
        value = bmiValue; score = bmiScore(sex, grade, bmiValue);
        category = bmiValue != null ? bmiCategory(sex, grade, bmiValue) : '';
        meta = ITEMS.bmi;
      } else {
        meta = itemMeta(item, sex);
        var v = values[item];
        value = (v === '' || v == null) ? null : Number(v);
        score = itemScore(item, sex, grade, value);
      }
      var weight = g.weights[item] || 0;
      var has = score != null;
      var bonus = 0;
      if (has && g.bonus && g.bonus[item]) bonus = bonusOf(item, sex, grade, Number(value), score);
      if (has) { total += score * weight / 100; bonusSum += bonus; }
      rows.push({ item: item, name: meta.name, unit: meta.unit, value: value, category: category,
                  weight: weight, score: has ? score : null,
                  weighted: has ? Math.round(score * weight) / 100 : null, bonus: bonus });
    });

    var final = Math.round((total + bonusSum) * 10) / 10;
    final = Math.min(120, final);
    var honor = honorScore(final);
    return { bmi: bmiValue, rows: rows, standard: Math.round(total * 10) / 10, bonus: bonusSum,
             final: final, rounded: Math.round(final), level: levelOf(final), honor: honor,
             honorTotal: Math.round(honor * 3 * 10) / 10, processTotal: Math.round((honor * 3 + 10) * 10) / 10 };
  }

  var API = { SCORES: SCORES, ITEMS: ITEMS, GRADES: GRADES, TABLE: TABLE, BMI: BMI, HONOR: HONOR,
              calcBMI: calcBMI, bmiScore: bmiScore, bmiCategory: bmiCategory,
              itemScore: itemScore, bonusOf: bonusOf, levelOf: levelOf, honorScore: honorScore, calculate: calculate };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.Physique = API;
})(typeof window !== 'undefined' ? window : this);
