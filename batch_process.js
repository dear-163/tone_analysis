const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY || "";
const model = "gemini-flash-lite-latest"; // 只用官方 -latest 別名，不指定固定版本號，避免像 gemini-1.5-flash 那樣哪天被除役又要手動改
const sourceDir = "/Users/changweihsiang/Desktop/全法說會稿";
const summaryOut = "/Users/changweihsiang/Desktop/Tone_Summary.csv";
const detailOut = "/Users/changweihsiang/Desktop/Quant/Tone_Detail.csv";

// ── Dictionaries ──
const DICTS = {
  POS:"上揚,上漲,主動,了結,享受,享有,使,保證,值得,偉大,價格上漲,儘管,償還,優勢,優於,充分,光榮,兌付,免費,利益,創意,創新,創造力,創造性,加強,努力,勤奮,區別,卓越,印象,友好,反彈,取得,取悅,受惠,受益,可取,可靠,可靠性,合作,吸引力,啟用,喜悅,喜歡,圓滿,地位,報酬,墊付,增強,壯觀,多才多藝,夢夢想,大大,好,好轉,安定,完全,完善,完成,完整性,完美,容易,實現,實益,寶貴,尊重,履行,巧奪天工,巨大,平滑,幸福,建設性,強,強度,影響,得天獨厚,從優,忠誠,快樂,恢復,恭維,愉快,慈善,成功,成就,成績,打動,承兌,授權,排他性,接受,推動,推進,提高,擅長,支援,收益,收藏,改進,放心,放款,效率,普及,更好,最大,最好,最終,最高,有利,有利可圖,有利於,有效,有效性,有益,棒,榮幸,榮譽,樂觀,模範,機會,歷次,活力,流行,深刻,清償,清新,滿意,滿足,無與倫比,熟練,熱情,特殊,特殊性,獎勵,獎金,獨家,獨特,獲利,獲得,理想,異常,發明,發明家,盈利,確保,確鑿,禮貌,稱讚,積極,穩健性,穩定,突破,立功,第一,精美,精通,素養,繁榮,美食,美麗,聯盟,聰明才智,聲望,能力,能夠,自信,致意,興奮,著名,蓬勃發展,解決,註定,誠信,讚譽,豐富,資訊,賦予,贏利,贏家,贏得,贖回,赫然,超越,超過,輝煌,透明度,進展,進步,達到,銘記,難以置信,需,靈感,青睞,革命,革命性,革新,順利,領先,領導,首映,驚喜,高級,高興,鼓勵,鼓舞人心".split(","),
  NEG:"一文不值,下放,下降,不一致,不佳,不便,不公,不切實際,不利,不力,不及,不可,不可逆轉,不可避免,不合情理,不合時宜,不善,不夠,不妥,不安,不宜,不幸,不得人心,不惜,不慎,不成比例,不敷,不景氣,不法,不滿,不當,不確定性,不符,不能,不良,不足,不道德,不適,不願,中傷,中斷,中止,串謀,串通,乾旱,事故,令人不安,企業,低,低估,低迷,佔領,作廢,侵吞,侵權,侵犯,侵蝕,俯瞰,倒塌,倒閉,假冒,偏差,偏見,偏離,做假,停工,停機,停止,停滯,停滯不前,停牌,停用,停電,停頓,偷,偽證,偽造,傳喚,傷害,僵局,充公,入侵,公害,公訴,共謀,冒牌貨,冒犯,冤枉,凍結,分心,分拆,分散,分歧,切斷,刑事,刑事責任,刑罰,判刑,判決,判處,利用,制裁,削弱,削減,剔除,剝削,剝奪,剝離,創傷,加劇,加重,動盪,勾結,危及,危害,危機,危險,原告,反壟斷,反對,反常,反托拉斯,反抗,反訴,取代,取消,受傷,受害者,受損,叛亂,召喚,召回,可恥,可疑,否定,否決,否認,唐突,問題,喪失,嘲笑,嚴厲,嚴格,嚴重,嚴重性,囚禁,回佣,回扣,回溯,回跌,回避,困惑,困擾,困難,堅持,報復,報應,壓力,壞,壟斷,失去,失寵,失控,失效,失敗,失望,失業,失真,失算,失職,失衡,失誤,失調,失責,失蹤,失靈,妨礙,威懾,威脅,嫌疑人,密謀,審查,封存,對手,對抗,對策,對簿公堂,尷尬,崩潰,差,差異,差距,差錯,差額,干擾,平倉,廉價,廢棄,廢止,廢除,延期,延誤,延遲,延長,弄錯,引起,弱,弱勢,弱點,強制,強迫,彌補,後果,徵用,徹底,忽略,忽視,急劇,性騷擾,恐嚇,恐慌,恐懼,恥辱,悲劇,悲慘,惡化,惡意,惹惱,意外,慘澹,懲罰,懷疑,撤回,撤資,撤銷,擅自,操縱,擔心,擾亂,攤薄,收縮,收緊,改組,攻擊,放棄,放緩,故障,敗訴,教唆,敲詐,敵對,敵意,昂貴,暫停,暴力,暴跌,暴露,曠工,歪曲,死亡,死刑,毀滅性,毫無,氣餒,污染,污點,沒收,沮喪,波動,洗錢,洩露,浪費,消失,消極,消耗,淫穢,混淆,清倉,清盤,清算,減價,減少,減損,減產,減記,溢出,滅,滅亡,滋擾,滯後,滯納金,滯銷,漏報,漏洞,激烈,濫用,瀆職,瀕危,災難,無利可圖,無序,無效,無法,無理,無知,無能,無視,煩人,煩惱,爭奪,爭端,爭論,爭議,犧牲,犯下,犯罪,猛烈,猥褻,猶豫不決,瓶頸,生病,申訴,異議,疏忽,疏遠,病死,痛苦,盜用,監禁,矛盾,短缺,破壞,破損,破產,破碎,禁令,禁制令,禁止,禁止令,禁用,禁運,穩定,突然,竄改,索賠,終止,結束,緊張,緊急,罰款,罷工".split(","),
  LIT:"上訴,上訴人,上述,下文,不倦,不可逆轉,中斷,乃是,事宜,交割,今後,代位,令狀,仲介,仲裁,仲裁人,休會,但書,何人,作證,侵吞,侵吞公款,侵權,促進,保人,保證,保釋,保障,信念,信用證,修改,修正,修訂,候審,偏見,停止,偽證,傳喚,傳票,債務人,債權,債權人,儘管,先行,光復,免除,入場,公投,公訴,公證,再審,凡,分割,分配,切除,刑事,刑事責任,判例,判刑,判定,判決,判處,剝奪,動產,勒告,勾結,原告,反壟斷,反悔,反托拉斯,反訴,反駁,取代,取消,受理,受讓人,受贈人,召喚,可執行,司法,合同,合法,合法化,合法性,合約,吊銷,同意,同等,否決,呈請,呼籲,和解,商議,善意,喪失,囚禁,回避,在場,執政,壟斷,失效,失職,委託,委託人,定罪,寄託,實習,實行,審判,審理,審結,審訊,寬容,尊重,對簿公堂,就此,干預,廢棄,廢止,廢除,強迫,律師,從此,徵用,憲法,懇求,扣押,承包,投訴,抗辯,抵押,拘留所,招標,指控,挪用,授,推翻,損害,撤回,撤銷,擁有者,據稱,收縮,收購人,故意,文書,更正,有效,案件,條件,條例,檢察,檢察官,欠款,此後,此處,歸還,死者,決定性,沒收,法令,法則,法官,法定,法庭,法律,法治,法規,法警,法院,清償,清算,減損,滯納金,濫用職權,無形,無效,無罪,爭論,爭執,爭端,特此,犯下,犯罪,由此,申請人,異議,當事人,發行者,盜用公款,監守自盜,監督,監禁,監管,矯正,禁令,禁制令,禁止,禁止令,租船,立即,立法,立法機關,章程,管轄,管轄權,索償,索賠,終止,結算,締約國,緩刑,罪,罪犯,罪行,罷免,聲明,聲稱,背書,自律,舉報人,處以,虧空,被告,被告人,裁判,裁定,裁決,補償,補救,複審,要約,見證,規例,規則,規定,規章,規管,解約,解除,觸犯,訂立,訊問,記載,訴狀,訴訟,評判,試用,誓言,誹謗,調停,調節,調解,請求,請願,諮詢,證人,證據,證明,證書,證詞,議員,議定書,買主,賠償,賠款,質問,質押,起草,起訴,起訴書,超出,超越,輕罪,轉讓,辯解,迄今,追償,退出,逃犯,連帶,違反,違反規定,遣散,適當,遺囑,遺贈,重審,長輩,開脫,阻礙,附件,附屬,降級,陪審,陪審員,非法,預審,頒佈,高利貸,默契".split(","),
  UNC:"不合時宜,不同,不安,不成文,不明,不甘,不確定性,中止,也許,交代,邀請,似乎,依賴,修改,修正,修訂,假定,假設,偏差,偏離,偶然,偶爾,冒著,出現,初步,動盪,十字路口,危險,反常,反思,取決於,可以,可想而知,可能,可能性,嘗試,大概,大約,待定,建議,幾乎,思考,想像,意外,意想不到,應急,懷疑,投機,投機性,投資,接近,推定,推測,提前,揮發,撫育,擔保,擱置,改變,敏感性,明顯,暴露,有些,有時,期待,期望,未,未定,未知,未經,根據,條件,機率,模棱兩可,模糊,殘缺不全,波動,波動性,混亂,混淆,漲跌,澄清,無形,無限期,猜測,畏懼,異常,相信,相關性,穩定性,突然,罕,考慮,蠻橫,表明,複審,複查,觀測,解讀,解釋,計算,評估,詮釋,認為,謠言,謹慎,證實,變,變動,變化,變幻莫測,變數,費率,近,近似,通常,逼近,配額,重估價,重新,量化,錯誤,防範,陌生,隨機,隱約,隱藏,難以預料,零星,非法,預估,預期,預測,預計,預防,預防措施,顯然,風險".split(",")
};

// ── Exclusions ──
const DEFAULT_EXCLUSIONS = [
  {id:'g01',category:'greeting',label:'大家好',type:'contains',value:'大家好'},
  {id:'g36',category:'greeting',label:'大家午安',type:'contains',value:'大家午安'},
  {id:'g37',category:'greeting',label:'大家下午好',type:'contains',value:'大家下午好'},
  {id:'g38',category:'greeting',label:'簡單為大家介紹',type:'contains',value:'簡單為大家介紹'},
  {id:'g39',category:'greeting',label:'我是…總經理',type:'regex',value:'我是.*(總經理|財務長|董事長|協理|執行長|副總|投顧|研究員|分析師)'},
  {id:'g02',category:'greeting',label:'各位好',type:'prefix',value:'各位好'},
  {id:'g03',category:'greeting',label:'早安',type:'prefix',value:'早安'},
  {id:'g04',category:'greeting',label:'午安',type:'prefix',value:'午安'},
  {id:'g05',category:'greeting',label:'晚安',type:'prefix',value:'晚安'},
  {id:'g06',category:'greeting',label:'謝謝各位',type:'prefix',value:'謝謝各位'},
  {id:'g07',category:'greeting',label:'謝謝大家',type:'contains',value:'謝謝大家'},
  {id:'g08',category:'greeting',label:'感謝各位',type:'prefix',value:'感謝各位'},
  {id:'g09',category:'greeting',label:'感謝大家',type:'prefix',value:'感謝大家'},
  {id:'g10',category:'greeting',label:'歡迎參加',type:'prefix',value:'歡迎參加'},
  {id:'g11',category:'greeting',label:'歡迎各位',type:'prefix',value:'歡迎各位'},
  {id:'g12',category:'greeting',label:'您好',type:'prefix',value:'您好'},
  {id:'g13',category:'greeting',label:'哈囉',type:'prefix',value:'哈囉'},
  {id:'g14',category:'greeting',label:'各位先進，大家',type:'prefix',value:'各位先進，大家'},
  {id:'g15',category:'greeting',label:'各位投資先進',type:'prefix',value:'各位投資先進'},
  {id:'g16',category:'greeting',label:'主席、各位',type:'prefix',value:'主席、各位'},
  {id:'g17',category:'greeting',label:'非常謝謝大家參加',type:'prefix',value:'非常謝謝大家參加'},
  {id:'g18',category:'greeting',label:'以上謝謝',type:'prefix',value:'以上謝謝'},
  {id:'g19',category:'greeting',label:'謝謝各位的聆聽',type:'contains',value:'謝謝各位的聆聽'},
  {id:'g20',category:'greeting',label:'蒞臨',type:'contains',value:'蒞臨'},
  {id:'g21',category:'greeting',label:'多多指教',type:'contains',value:'多多指教'},
  {id:'g22',category:'greeting',label:'敬祝',type:'prefix',value:'敬祝'},
  {id:'g23',category:'greeting',label:'身體健康',type:'contains',value:'身體健康'},
  {id:'g24',category:'greeting',label:'投資順利',type:'contains',value:'投資順利'},
  {id:'g25',category:'greeting',label:'熱情參與',type:'contains',value:'熱情參與'},
  {id:'g26',category:'greeting',label:'非常感謝',type:'prefix',value:'非常感謝'},
  {id:'g27',category:'greeting',label:'各位嘉賓',type:'prefix',value:'各位嘉賓'},
  {id:'g28',category:'greeting',label:'各位貴賓',type:'prefix',value:'各位貴賓'},
  {id:'g29',category:'greeting',label:'也謝謝',type:'prefix',value:'也謝謝'},
  {id:'g30',category:'greeting',label:'光臨',type:'contains',value:'光臨'},
  {id:'s01',category:'serial',label:'第一點',type:'prefix',value:'第一點'},
  {id:'s02',category:'serial',label:'第二點',type:'prefix',value:'第二點'},
  {id:'s03',category:'serial',label:'第三點',type:'prefix',value:'第三點'},
  {id:'s04',category:'serial',label:'（一）',type:'prefix',value:'（一）'},
  {id:'s05',category:'serial',label:'（二）',type:'prefix',value:'（二）'},
  {id:'s06',category:'serial',label:'（三）',type:'prefix',value:'（三）'},
  {id:'s07',category:'serial',label:'數字序號',type:'regex',value:'^\\d+[.、。]'},
  {id:'s08',category:'serial',label:'字母序號',type:'regex',value:'^[a-zA-Z][.、)）]'},
  {id:'s09',category:'serial',label:'首先，',type:'prefix',value:'首先，'},
  {id:'s10',category:'serial',label:'其次，',type:'prefix',value:'其次，'},
  {id:'s11',category:'serial',label:'再者，',type:'prefix',value:'再者，'},
  {id:'t01',category:'time',label:'今天',type:'exact',value:'今天'},
  {id:'t02',category:'time',label:'本季',type:'exact',value:'本季'},
  {id:'t03',category:'time',label:'本年度',type:'exact',value:'本年度'},
  {id:'t04',category:'time',label:'Q1',type:'exact',value:'Q1'},
  {id:'t05',category:'time',label:'Q2',type:'exact',value:'Q2'},
  {id:'t06',category:'time',label:'Q3',type:'exact',value:'Q3'},
  {id:'t07',category:'time',label:'Q4',type:'exact',value:'Q4'},
  {id:'p01',category:'presentation',label:'如畫面所示',type:'prefix',value:'如畫面所示'},
  {id:'p02',category:'presentation',label:'接下來，請',type:'prefix',value:'接下來，請'},
  {id:'p03',category:'presentation',label:'接下來請',type:'prefix',value:'接下來請'},
  {id:'p04',category:'presentation',label:'聲明',type:'contains',value:'聲明'},
  {id:'p05',category:'presentation',label:'法人說明會',type:'contains',value:'法人說明會'},
  {id:'p06',category:'presentation',label:'法說會',type:'contains',value:'法說會'},
  {id:'p07',category:'presentation',label:'麥克風',type:'contains',value:'麥克風'},
  {id:'p08',category:'presentation',label:'聊天室',type:'contains',value:'聊天室'},
  {id:'p09',category:'presentation',label:'會後',type:'contains',value:'會後'},
  {id:'p10',category:'presentation',label:'自行閱覽',type:'contains',value:'自行閱覽'},
  {id:'p11',category:'presentation',label:'簡報大綱',type:'contains',value:'簡報大綱'},
  {id:'p12',category:'presentation',label:'舉手功能',type:'contains',value:'舉手功能'},
  {id:'p13',category:'presentation',label:'文字提問',type:'contains',value:'文字提問'},
  {id:'p14',category:'presentation',label:'把時間交給',type:'contains',value:'把時間交給'},
  {id:'p15',category:'presentation',label:'做簡報',type:'contains',value:'做簡報'},
  {id:'p16',category:'presentation',label:'由我來進行簡報',type:'contains',value:'由我來進行簡報'},
  {id:'p17',category:'presentation',label:'邀請…說明',type:'regex',value:'邀請.*(報告|簡報|說明)'},
  {id:'e01',category:'closing',label:'到此結束',type:'contains',value:'到此結束'},
  {id:'e02',category:'closing',label:'法說會結束',type:'regex',value:'法說會.*結束'},
  {id:'e03',category:'closing',label:'說明會結束',type:'regex',value:'說明會.*結束'},
  {id:'e04',category:'closing',label:'簡報就結束',type:'contains',value:'簡報就結束'},
  {id:'e05',category:'closing',label:'告一段落',type:'contains',value:'告一段落'},
  {id:'e06',category:'closing',label:'會議時間差不多',type:'contains',value:'會議時間也差不多'},
  {id:'q01',category:'qa_host',label:'QA時間',type:'regex',value:'(QA|Q&A|問答|意見交換).*時間'},
  {id:'q02',category:'qa_host',label:'是否有問題發問',type:'regex',value:'是否.*問題.*發問'},
  {id:'q03',category:'qa_host',label:'進入意見交換',type:'contains',value:'進入意見交換'},
  {id:'q04',category:'qa_host',label:'利用…提問',type:'regex',value:'利用.*(提問|留言|聊天室)'},
  {id:'q05',category:'qa_host',label:'第X個問題',type:'regex',value:'第[一二三四五六七八九十\\d]+個問題'},
  {id:'q06',category:'qa_host',label:'謝謝您的提問',type:'contains',value:'謝謝您的提問'},
  {id:'q07',category:'qa_host',label:'有X個問題',type:'regex',value:'有[一二三四五六七八九兩幾\\d]+個問題'},
  {id:'q08',category:'qa_host',label:'好，謝謝',type:'exact',value:'好，謝謝'},
  {id:'q09',category:'qa_host',label:'好的，謝謝',type:'exact',value:'好的，謝謝'},
  {id:'q10',category:'qa_host',label:'是否還有其他提問',type:'contains',value:'是否還有其他提問'},
  {id:'q11',category:'qa_host',label:'下一個問題是',type:'prefix',value:'下一個問題是'},
  {id:'q12',category:'qa_host',label:'沒有其他問題',type:'contains',value:'沒有其他問題'},
  {id:'q13',category:'qa_host',label:'開放最後一個問題',type:'contains',value:'開放最後一個問題'},
  {id:'q14',category:'qa_host',label:'想提出問題的嗎',type:'contains',value:'提出問題的嗎'},
  {id:'q15',category:'qa_host',label:'接著是…問題',type:'regex',value:'^接著是.*問題$'},
  {id:'q16',category:'qa_host',label:'最後一個問題是',type:'prefix',value:'最後一個問題是'},
  {id:'q17',category:'qa_host',label:'是否還有其他問題呢',type:'contains',value:'是否還有其他問題'},
  {id:'q18',category:'qa_host',label:'現在我們開放提問',type:'prefix',value:'現在我們開放提問'},
  {id:'f01',category:'transition',label:'接下來報告',type:'prefix',value:'接下來報告'},
  {id:'f02',category:'transition',label:'稍微說明',type:'prefix',value:'稍微說明'},
  {id:'f03',category:'transition',label:'旁邊的簡報',type:'prefix',value:'旁邊的簡報'},
  {id:'f04',category:'transition',label:'各位可以看到…部分',type:'regex',value:'各位可以看到.*部分'},
  {id:'f05',category:'transition',label:'藉此機會',type:'contains',value:'藉此機會'},
  {id:'f06',category:'transition',label:'感謝大家的關注',type:'contains',value:'感謝大家的關注'},
  {id:'f07',category:'transition',label:'持續支持',type:'contains',value:'持續支持我們'},
  {id:'f08',category:'transition',label:'謝謝我們的',type:'prefix',value:'謝謝我們的'},
  {id:'f09',category:'transition',label:'時間戳記',type:'regex',value:'^\\(\\d{2}:\\d{2}:\\d{2}\\)'},
  {id:'f10',category:'transition',label:'非常感謝…分享與說明',type:'regex',value:'非常感謝.*(分享|說明|簡報)'},
];

function isNeutral(sent) {
  for (const ex of DEFAULT_EXCLUSIONS) {
    try {
      if (ex.type==='exact' && sent===ex.value) return true;
      if (ex.type==='prefix' && sent.startsWith(ex.value)) return true;
      if (ex.type==='contains' && sent.includes(ex.value)) return true;
      if (ex.type==='regex' && new RegExp(ex.value).test(sent)) return true;
    } catch(e){}
  }
  return false;
}

function matches(sent, dict) {
  return [...new Set(dict.filter(w => w && sent.includes(w)))];
}

function dictMatches(sent) {
  return {
    POS: matches(sent, DICTS.POS),
    NEG: matches(sent, DICTS.NEG),
    LIT: matches(sent, DICTS.LIT),
    UNC: matches(sent, DICTS.UNC),
  };
}

function localCat(sent, m) {
  if (isNeutral(sent)) return ['NEUTRAL'];
  const counts = {POS:m.POS.length, NEG:m.NEG.length, LIT:m.LIT.length, UNC:m.UNC.length};
  const max = Math.max(counts.POS, counts.NEG, counts.LIT, counts.UNC);
  if (max === 0) return ['NONE'];
  return Object.keys(counts).filter(k => counts[k] === max);
}

const MGMT_TITLES = /總經理|執行長|CEO|CFO|COO|CTO|副總|董事長|董事|首席|主管|協理|經理|財務長|發言人|副發言人|管理層|會計主管|業務|資深/;
const NON_MGMT_TITLES = /Investor\s*Relation|IR|主持人|司儀|媒體|分析師|投資人|記者|聽眾|研究員|主持|座談|法說|證券|投顧/;
const NON_MGMT_LABEL_PREFIX = /^(主持人|司儀|分析師|投資人|法人|媒體|記者|Investor\s*Relation|IR)[:：]/i;
const GREETING_TO_TITLE_PAT = /^.{0,6}(總經理|執行長|CEO|CFO|COO|CTO|副總|董事長|經理|協理|財務長|發言人)[，,、]\s*(早安|午安|晚安|您好|你好|大家好)/;

function getRole(sent, lastRole) {
  const labelPat = /\*\*[^*]+-[^*]+,\s*([^*]+)\*\*/;
  const labelMatch = sent.match(labelPat);
  if (labelMatch) {
    const title = labelMatch[1].trim();
    if (MGMT_TITLES.test(title)) return 1;
    if (NON_MGMT_TITLES.test(title)) return 0;
  }
  const boldPat = /\*\*([^*]+)\*\*/;
  const boldMatch = sent.match(boldPat);
  if (boldMatch) {
    const title = boldMatch[1].trim();
    if (MGMT_TITLES.test(title)) return 1;
    if (NON_MGMT_TITLES.test(title)) return 0;
  }
  if (GREETING_TO_TITLE_PAT.test(sent.trim())) return 0;
  if (MGMT_TITLES.test(sent)) return 1;
  if (NON_MGMT_LABEL_PREFIX.test(sent.trim())) return 0;
  if (lastRole !== null) return lastRole;
  return null;
}

function uncRefine(sent) {
  if (/(成長|擴張|增長|提升|擴大|發展|上升)/.test(sent)) return 1;
  if (/(風險|壓力|困難|不確定|危險|挑戰|下滑)/.test(sent)) return 2;
  return 0;
}

function calcTone(s) {
  const p = s.pos + s.pos_u, n = s.neg + s.neg_u, l = s.lit;
  const d = s.pos + s.neg + s.lit + s.unc;
  return d === 0 ? 0 : (p - n - l) / d;
}

const QA_START_PAT = /^#{1,3}\s*(q&a|問答|問答環節|提問|analyst\s*q)|^#QA_START/i;
const TRANSCRIPT_START_PAT = /^#{1,3}\s*(transcript|逐字稿)/i;
const QA_CONCEPT_PAT = /Q\s*&?\s*A|問答|提問|意見交(換|流)|問與答/i;
const QA_TRANSITION_PAT = /接下來|現在|開始|進行|進入|即將|最後|來到|下一(個|個階段)|下個|準備|歡迎|開放|階段/;
const QA_LABEL_PAT = /^(投資先進|法人|分析師|主持人|Q)[:：]/;
const QA_TEXT_PAT = /接下來是\s*(Q&A|問答|意見交換|提問時間)|進入\s*(Q&A|問答環節|提問環節|意見交換環節)|^開放提問|Q&A\s*(時間|環節|開始)|question[\s-]*(and|&)[\s-]*answer\s*session|open (the floor|the call) for questions|we('|’)?ll now (take|open for) questions|let'?s (start|begin) the Q&A|operator instructions|now open for questions|this concludes our (key messages|prepared remarks|presentation)/i;
const QUESTION_PAT = /請問|想請教|請教一下|請教|想問|可否請教|想了解一下|請問一下/;
const QA_MIN_SENT = 20;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getProgressBar(current, total, barLength = 25) {
  const percent = (current / total) * 100;
  const progress = Math.round((current / total) * barLength);
  const filled = "█".repeat(progress);
  const empty = "░".repeat(barLength - progress);
  return `[${filled}${empty}] ${percent.toFixed(1)}% (${current}/${total})`;
}

// ── Pass 1: Parse roles & QA ──
function analyzeRoles(text) {
  const lines = text.split(/\n/);
  let startLine = 0;
  for (let i=0; i<lines.length; i++) {
    if (TRANSCRIPT_START_PAT.test(lines[i].trim())) { startLine = i+1; break; }
  }
  const trimmed = startLine > 0 ? lines.slice(startLine).join('\n') : text;
  const allSents = trimmed.replace(/\[\d+:\d+:\d+\]|Page \d+ of \d+|\[\d+ 分鐘\]/gi,'')
    .split(/[。！？\n\r]/).map(s=>s.trim()).filter(s=>s.length>3 && !/^\d+$/.test(s));

  if (!allSents.length) return null;
  const isMarker = allSents.map(s => QA_START_PAT.test(s.trim()));
  let roles = allSents.map(s => getRole(s, null));
  for (let i = 0; i < allSents.length; i++) {
    if (roles[i] === null) {
      let lastRole = i > 0 ? roles[i-1] : null;
      if (i < 20 && lastRole === 0) {
        lastRole = 1;
      }
      const ex = getRole(allSents[i], lastRole);
      if (ex !== null) roles[i] = ex;
    }
  }
  return {allSents, isMarker, roles};
}

function resolveRemainingRoles(roles) {
  // 註：曾嘗試「連續超過 5 句非管理層就強制翻成管理層」的規則，
  // 但實測真實語料發現：Q&A 段分析師的長提問（含 **姓名-券商,Analyst** 標籤後的整段問題）
  // 會被大量翻成管理層發言、污染 Tone_Q（例如為升：Q 段非管理層句從 89 句被砍到只剩 5 句），故不採用。
  // 「整份檔案都找不到管理層」的極端情況由 finalizeMetrics 的救回機制處理即可。
  let ctx = 1;
  for (let i = 0; i < roles.length; i++) {
    if (roles[i] === null) {
      if (i < 20 && ctx === 0) {
        ctx = 1;
      }
      roles[i] = ctx;
    } else {
      ctx = roles[i];
    }
  }
}

function analyzePhases(allSents, isMarker, roles) {
  let qaStarted = false, qaStreak = 0;
  const phases = allSents.map((s, idx) => {
    if (!qaStarted) {
      if (isMarker[idx]) {
        qaStarted = true;
      } else if (idx >= QA_MIN_SENT) {
        const sTrim = s.trim();
        // 預告句過濾：句子含「延後詞」時通常是報告段在預告稍後才有 Q&A，不能當成轉場觸發。
        // 但延後詞也可能只是順帶提到（例：「我們現在開始進行 Q&A，會將『之前』蒐集到的提問先回答」），
        // 所以句中同時有「立即開始詞」時仍視為真正的轉場，不套用過濾
        const hasDefer = /之前|準備|稍後|等一下|待會|結束後|報告後|簡報後|結束之後|分為|分成/i.test(sTrim);
        const hasNow = /現在|正式|馬上|立刻|即刻|接(下來|著|續).{0,4}(是|進入|進行|開始)[^，。]{0,6}(Q\s*&?\s*A|問答|提問|意見交(換|流))|(一併|逐一|先)(進行)?回答|針對[^，。]{0,10}(提問|問題)[^，。]{0,8}回答/i.test(sTrim);
        const isPreAnnounce = hasDefer && !hasNow;
        let triggered = false;
        if (!isPreAnnounce) {
          if (QA_START_PAT.test(sTrim) || QA_TEXT_PAT.test(s) || QA_LABEL_PAT.test(sTrim) || (QA_CONCEPT_PAT.test(s) && QA_TRANSITION_PAT.test(s))) {
            qaStarted = true;
            triggered = true;
          }
        }
        if (!triggered) {
          if (idx > 0 && roles[idx-1]===0 && QUESTION_PAT.test(allSents[idx-1]) && roles[idx]===1) {
            qaStreak++;
            if (qaStreak >= 2) qaStarted = true;
          } else {
            qaStreak = 0;
          }
        }
      }
    }
    return qaStarted ? 1 : 0;
  });
  const needsPhaseAI = !phases.some(p => p === 1) && allSents.length > QA_MIN_SENT;
  return {phases, needsPhaseAI};
}

function finalizeMetrics(allSents, isMarker, roles, phases) {
  const keepIdx = [];
  for (let i=0; i<allSents.length; i++) if (!isMarker[i]) keepIdx.push(i);
  const rawSents = keepIdx.map(i=>allSents[i]);
  const finalRoles = keepIdx.map(i=>roles[i]);
  const finalPhases = keepIdx.map(i=>phases[i]);

  const hasMgmt = finalRoles.some(r => r === 1);
  if (!hasMgmt && rawSents.length > 5) {
    for (let i = 0; i < finalRoles.length; i++) {
      if (finalPhases[i] === 0) {
        finalRoles[i] = 1;
      }
    }
    const stillNoMgmt = finalRoles.every(r => r !== 1);
    if (stillNoMgmt) {
      for (let i = 0; i < finalRoles.length; i++) {
        const s = rawSents[i];
        const isQ = QA_LABEL_PAT.test(s.trim()) || QUESTION_PAT.test(s);
        if (!isQ) {
          finalRoles[i] = 1;
        }
      }
    }
  }

  const stats = {
    P:{pos:0,pos_u:0,neg:0,neg_u:0,lit:0,unc:0,total:0,neutral:0},
    Q:{pos:0,pos_u:0,neg:0,neg_u:0,lit:0,unc:0,total:0,neutral:0}
  };
  const details = [], uncIndices = [];

  rawSents.forEach((sent, i) => {
    const m = dictMatches(sent);
    const cats = localCat(sent, m);
    const ref = uncRefine(sent);
    const key = finalPhases[i]===0 ? 'P' : 'Q';
    const role = finalRoles[i];
    const isUnc = cats.includes('UNC');
    if (role===1) {
      if (cats.includes('NEUTRAL')) { stats[key].neutral++; }
      else {
        stats[key].total++;
        cats.forEach(cat => {
          if (cat==='UNC') {
            stats[key].unc++;
            if (ref===1) stats[key].pos_u++;
            else if (ref===2) stats[key].neg_u++;
          } else if (cat!=='NONE') {
            const k = cat.toLowerCase();
            if (stats[key][k]!==undefined) stats[key][k]++;
          }
        });
        if (isUnc) uncIndices.push({detailIdx:details.length, key});
      }
    }
    details.push({
      sentence:sent, role, phase:finalPhases[i], localCat:cats.join('+'), refine:isUnc?ref:0, aiRefined:false,
      posWords:m.POS.join('，'),
      negWords:m.NEG.join('，'),
      litWords:m.LIT.join('，'),
      uncWords:m.UNC.join('，'),
    });
  });

  const merged = {pos:stats.P.pos+stats.Q.pos,pos_u:stats.P.pos_u+stats.Q.pos_u,neg:stats.P.neg+stats.Q.neg,neg_u:stats.P.neg_u+stats.Q.neg_u,lit:stats.P.lit+stats.Q.lit,unc:stats.P.unc+stats.Q.unc};
  return {Tone_P:calcTone(stats.P),Tone_Q:calcTone(stats.Q),Tone_T:calcTone(merged),counts:stats,details,uncIndices};
}

// ── Gemini API Client ──
// 註：舊版有一個「aiFailedGlobally」全域開關——只要任何一個 chunk 重試 4 次都失敗（例如短暫的
// 429 頻率限制），就永久關閉整個 run 剩下所有檔案的 AI，只能全部 fallback 回字典。
// 真實測試發現：單一檔案跑沒事，但 2000+ 份檔案的大批次會發出遠比單檔測試更多次的 chunk 請求，
// 更容易撞到一次性的頻率限制，一旦撞到就把後面全部檔案的 AI 都跟著關掉，即使限制窗口早就過了。
// 改成「只讓失敗的這個 chunk fallback 回字典，其他 chunk 繼續正常嘗試 AI」，不設永久關閉開關；
// 遇到 429/額度限制時，優先解析 Google 回傳的建議重試秒數（RetryInfo.retryDelay 或訊息裡的
// 「retry in Xs」），而不是用太短的固定指數退避去硬闖。
function parseRetryDelaySeconds(errBody) {
  try {
    const parsed = JSON.parse(errBody);
    const detail = parsed?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
    if (detail?.retryDelay) {
      const n = parseFloat(detail.retryDelay);
      if (Number.isFinite(n)) return n;
    }
    const m = /retry in ([\d.]+)s/i.exec(parsed?.error?.message || errBody);
    if (m) return parseFloat(m[1]);
  } catch (e) {}
  return null;
}

async function callGemini(systemPrompt, promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let delay = 2000;
  for (let r = 0; r < 5; r++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(90000)
      });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429 || res.status === 403 || text.includes("Quota exceeded") || text.includes("RESOURCE_EXHAUSTED")) {
          if (r === 4) throw new Error(`API error: ${res.status} - ${text}`);
          const suggested = parseRetryDelaySeconds(text);
          const waitMs = suggested != null ? Math.min(suggested * 1000 + 500, 65000) : delay;
          console.warn(`Gemini API rate limited (attempt ${r+1}), retrying after ${Math.round(waitMs/1000)}s...`);
          await sleep(waitMs);
          delay *= 2;
          continue;
        }
        throw new Error(`API error: ${res.status} - ${text}`);
      }
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      if (r === 4) {
        throw e;
      }
      console.warn(`Gemini API request failed (attempt ${r+1}), retrying after ${delay}ms...`, e.message);
      await sleep(delay);
      delay *= 2;
    }
  }
}

// ── Main batch process runner ──
async function run() {
  console.log("Scanning directory:", sourceDir);
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith(".txt")).sort();
  console.log(`Found ${files.length} transcript files.`);

  const records = [];
  
  // Phase 1: Local parsing
  console.log("Analyzing file structures locally...");
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filepath = path.join(sourceDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const name = file.replace(".txt", "");
    
    const local = analyzeRoles(content);
    if (!local) {
      records.push({ name, empty: true });
      continue;
    }
    
    records.push({
      fileIdx: i,
      name,
      allSents: local.allSents,
      isMarker: local.isMarker,
      roles: local.roles,
      aiUsed: false,
      aiError: false
    });
  }

  // Phase 2: AI Role Classification
  console.log("\nRunning batch speaker role classification (AI)...");
  const needRoles = records.filter(r => !r.empty && r.roles.some(rl => rl === null));
  console.log(`Files needing role classification: ${needRoles.length}`);
  
  if (needRoles.length) {
    const CHUNK_SIZE = 40;
    for (let k = 0; k < needRoles.length; k += CHUNK_SIZE) {
      const chunk = needRoles.slice(k, k + CHUNK_SIZE);
      const items = [];
      const lines = [];
      
      chunk.forEach(f => {
        const needIdxs = new Set();
        f.roles.forEach((r, idx) => {
          if (r === null) {
            needIdxs.add(idx);
            for (let j = Math.max(0, idx-2); j < idx; j++) if (f.roles[j] === 1) needIdxs.add(j);
            for (let j = idx+1; j <= Math.min(f.allSents.length-1, idx+2); j++) if (f.roles[j] === 1) needIdxs.add(j);
          }
        });
        if (!needIdxs.size) return;
        const sorted = Array.from(needIdxs).sort((a,b)=>a-b);
        const merged = [];
        let start = sorted[0], end = sorted[0];
        for (let x = 1; x < sorted.length; x++) {
          if (sorted[x] === end + 1) end = sorted[x];
          else { merged.push([start, end]); start = sorted[x]; end = sorted[x]; }
        }
        merged.push([start, end]);
        
        merged.forEach(([s,e], bi) => {
          if (bi > 0) lines.push('...');
          for (let idx = s; idx <= e; idx++) {
            const label = `F${f.fileIdx}S${idx}`;
            const tag = f.roles[idx]===1 ? '[管理層]' : f.roles[idx]===0 ? '[其他]' : '[?]';
            if (f.roles[idx] === null) items.push({ fileIdx: f.fileIdx, sentIdx: idx, label });
            lines.push(`${label} ${tag} ${f.allSents[idx]}`);
          }
        });
      });
      
      if (!items.length) continue;
      
      const curIdx = Math.floor(k/CHUNK_SIZE) + 1;
      const totIdx = Math.ceil(needRoles.length/CHUNK_SIZE);
      console.log(`Role classification progress: ${getProgressBar(curIdx, totIdx)} - Chunk ${curIdx}/${totIdx} (${items.length} items)...`);
      try {
        const CLASSIFY_PROMPT = `你是法人說明會逐字稿分析專家。以下是多份逐字稿中，不確定角色的句子與其前後文片段，每行格式為「編號 角色標記 句子內容」。
請針對每一個標記為 [?] 的句子，判斷該句是否為管理層本人發言：
- 1 表示是管理層發言
- 0 表示不是管理層發言
請嚴格以 JSON 物件格式回傳，key 為該句編號（例如 "F3S57"），value 為 0 或 1，只需包含 [?] 的句子，不得有任何其他文字。範例：{"F3S57":1,"F3S61":0}`;
        
        const resultMap = await callGemini(CLASSIFY_PROMPT, lines.join('\n'));
        const byFile = new Map();
        chunk.forEach(f => byFile.set(f.fileIdx, f.roles));
        
        items.forEach(({fileIdx, sentIdx, label}) => {
          if (label in resultMap && (resultMap[label] == 0 || resultMap[label] == 1)) {
            byFile.get(fileIdx)[sentIdx] = Number(resultMap[label]);
          }
        });
        chunk.forEach(f => f.aiUsed = true);
      } catch (e) {
        console.warn(`Role classification chunk failed: ${e.message}. Falling back to dictionary rules.`);
      }
      await sleep(1000); // 拉長 chunk 間隔，降低撞到免費額度 RPM（每分鐘請求數）限制的機率
    }
  }
  
  // Resolve remaining roles
  records.forEach(r => {
    if (!r.empty) resolveRemainingRoles(r.roles);
  });

  // Phase 3: Q&A Phases
  console.log("\nRunning phase division (Q&A)...");
  const needPhaseAI = [];
  records.forEach(r => {
    if (r.empty) return;
    const {phases, needsPhaseAI} = analyzePhases(r.allSents, r.isMarker, r.roles);
    r.phases = phases;
    if (needsPhaseAI) needPhaseAI.push(r);
  });
  console.log(`Files needing Q&A start finder: ${needPhaseAI.length}`);
  
  if (needPhaseAI.length) {
    const CHUNK_SIZE = 10;
    for (let k = 0; k < needPhaseAI.length; k += CHUNK_SIZE) {
      const chunk = needPhaseAI.slice(k, k + CHUNK_SIZE);
      const lines = chunk.map(f => f.allSents.map((s,j) => `F${f.fileIdx}S${j} ${s}`).join('\n'));
      
      const curIdx = Math.floor(k/CHUNK_SIZE) + 1;
      const totIdx = Math.ceil(needPhaseAI.length/CHUNK_SIZE);
      console.log(`Q&A start finder progress: ${getProgressBar(curIdx, totIdx)} - Chunk ${curIdx}/${totIdx}...`);
      try {
        const QA_FINDER_PROMPT = `你是法人說明會逐字稿分析專家。以下是多份逐字稿的句子列表，每行格式為「編號 句子」，編號格式為 F<檔案序號>S<句子序號>，是全域唯一識別碼。
請針對每一份檔案（依 F 後面的檔案序號分組），各自找出「從管理層報告，正式轉為開放問答（Q&A）」的第一句編號——也就是真正開始有人（主持人或投資人）在問問題、或管理層開始處理提問內容的第一句，
而不是預告「等一下會有Q&A」這種還在報告階段的句子，也不是事後才提到「謝謝大家的提問」這種已經結束的句子。
如果某份檔案完全找不到明確的問答轉折點，該檔案不用出現在回傳結果中。
請嚴格以 JSON 物件格式回傳，key 為檔案序號（例如 "3"），value 為該檔案問答起始句的完整編號字串（例如 "F3S57"），不得有任何其他文字。範例：{"3":"F3S57","9":"F9S102"}`;
        
        const resultMap = await callGemini(QA_FINDER_PROMPT, lines.join('\n\n'));
        chunk.forEach(f => {
          f.aiUsed = true;
          const label = resultMap[String(f.fileIdx)];
          if (label) {
            const m = /^F(\d+)S(\d+)$/.exec(label);
            if (m && Number(m[1]) === f.fileIdx) {
              const foundIdx = Number(m[2]);
              for (let idx = foundIdx; idx < f.phases.length; idx++) f.phases[idx] = 1;
            }
          }
        });
      } catch (e) {
        console.warn(`Q&A start chunk failed: ${e.message}. Using default dictionary boundaries.`);
      }
      await sleep(1000); // 拉長 chunk 間隔，降低撞到免費額度 RPM（每分鐘請求數）限制的機率
    }
  }

  // Phase 4: Collect metrics & local UNC
  console.log("\nCalculating initial metrics...");
  const uncPool = [];
  records.forEach(r => {
    if (r.empty) {
      r.metrics = { Tone_P:0, Tone_Q:0, Tone_T:0, counts:{ P:{pos:0,pos_u:0,neg:0,neg_u:0,lit:0,unc:0,total:0,neutral:0}, Q:{pos:0,pos_u:0,neg:0,neg_u:0,lit:0,unc:0,total:0,neutral:0} }, details:[], uncIndices:[] };
      return;
    }
    r.metrics = finalizeMetrics(r.allSents, r.isMarker, r.roles, r.phases);
    r.metrics.uncIndices.forEach(u => {
      const detail = r.metrics.details[u.detailIdx];
      uncPool.push({
        label: `F${r.fileIdx}D${u.detailIdx}`,
        sentence: detail.sentence,
        fileIdx: r.fileIdx,
        detailIdx: u.detailIdx,
        key: u.key
      });
    });
  });
  console.log(`Uncertainty (UNC) sentences gathered: ${uncPool.length}`);

  // Phase 5: AI UNC Refinement
  if (uncPool.length) {
    const CHUNK_SIZE = 100;
    for (let k = 0; k < uncPool.length; k += CHUNK_SIZE) {
      const chunk = uncPool.slice(k, k + CHUNK_SIZE);
      const lines = chunk.map(it => `${it.label} ${it.sentence}`).join('\n');
      
      const curIdx = Math.floor(k/CHUNK_SIZE) + 1;
      const totIdx = Math.ceil(uncPool.length/CHUNK_SIZE);
      console.log(`UNC refining progress: ${getProgressBar(curIdx, totIdx)} - Chunk ${curIdx}/${totIdx} (${chunk.length} items)...`);
      try {
        const GMINI_PROMPT = `你是法人說明會逐字稿分析專家。以下是已被標記為 [不確定 (UNC)] 的句子列表，每行格式為「編號 句子內容」。
請你根據前後文脈絡（這裡只提供該句本身），判斷該句在情感傾向或語氣上，是否能被進一步細分為「偏向正向 (POS)」或「偏向負向 (NEG)」。
分類標準：
- 1 表示該不確定句偏向正向 (POS)
- 2 表示該不確定句偏向負向 (NEG)
- 0 表示該不確定句依然中立或無法判斷
請嚴格以 JSON 物件格式回傳，key 為該句編號（例如 "F3D5"），value 為 0, 1 或 2，不得有任何其他文字。範例：{"F3D5":1,"F3D8":0,"F4D12":2}`;
        
        const resultMap = await callGemini(GMINI_PROMPT, lines);
        const byFile = new Map();
        records.forEach(r => { if (!r.empty) byFile.set(r.fileIdx, r); });
        
        chunk.forEach(u => {
          const f = byFile.get(u.fileIdx);
          const v = resultMap[u.label];
          if (v == 0 || v == 1 || v == 2) {
            f.metrics.details[u.detailIdx].refine = Number(v);
            f.metrics.details[u.detailIdx].aiRefined = true;
            f.aiUsed = true;
          }
        });
      } catch (e) {
        console.warn(`UNC refining chunk failed: ${e.message}. Using default dictionary rules.`);
      }
      await sleep(1000); // 拉長 chunk 間隔，降低撞到免費額度 RPM（每分鐘請求數）限制的機率
    }

    // Re-calculate stats with refined UNC metrics
    records.forEach(f => {
      if (f.empty || !f.metrics.uncIndices.length) return;
      const nc = { P: { ...f.metrics.counts.P, pos_u: 0, neg_u: 0 }, Q: { ...f.metrics.counts.Q, pos_u: 0, neg_u: 0 } };
      f.metrics.uncIndices.forEach(u => {
        const v = f.metrics.details[u.detailIdx].refine;
        if (v === 1) nc[u.key].pos_u++;
        else if (v === 2) nc[u.key].neg_u++;
      });
      const m = { pos: nc.P.pos + nc.Q.pos, pos_u: nc.P.pos_u + nc.Q.pos_u, neg: nc.P.neg + nc.Q.neg, neg_u: nc.P.neg_u + nc.Q.neg_u, lit: nc.P.lit + nc.Q.lit, unc: nc.P.unc + nc.Q.unc };
      f.metrics.counts = nc;
      f.metrics.Tone_P = calcTone(nc.P);
      f.metrics.Tone_Q = calcTone(nc.Q);
      f.metrics.Tone_T = calcTone(m);
    });
  }

  // Phase 6: Output Reports
  console.log("\nGenerating summary report CSV...");
  function csvEsc(v) { return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; }
  
  const summaryHdr = 'ID / COMPANY,TONE_P,TONE_Q,TONE_T,P_正向,P_負向,P_爭議,P_不確定,P_排除,P_有效,Q_正向,Q_負向,Q_爭議,Q_不確定,Q_排除,Q_有效,AI\n';
  const summaryRows = records.map(r => {
    if (r.empty) {
      return `${csvEsc(r.name)},0.0000,0.0000,0.0000,0,0,0,0,0,0,0,0,0,0,0,0,字典`;
    }
    const P = r.metrics.counts.P;
    const Q = r.metrics.counts.Q;
    const aiStr = r.aiUsed ? "✓ AI" : "字典";
    return `${csvEsc(r.name)},${r.metrics.Tone_P.toFixed(4)},${r.metrics.Tone_Q.toFixed(4)},${r.metrics.Tone_T.toFixed(4)},${P.pos+P.pos_u},${P.neg+P.neg_u},${P.lit},${P.unc},${P.neutral||0},${P.total},${Q.pos+Q.pos_u},${Q.neg+Q.neg_u},${Q.lit},${Q.unc},${Q.neutral||0},${Q.total},${aiStr}`;
  });
  
  // Write Summary UTF-8 BOM
  fs.writeFileSync(summaryOut, '\ufeff' + summaryHdr + summaryRows.join('\n'), 'utf-8');
  console.log(`Summary CSV written to: ${summaryOut}`);

  console.log("Generating detail report CSV...");
  const detailHdr = 'COMPANY,SENTENCE,ROLE,PHASE,CATEGORY,REFINED,AI_REFINED,POS_WORDS,NEG_WORDS,LIT_WORDS,UNC_WORDS,TONE_P,TONE_Q,TONE_T\n';
  const detailRows = [];
  records.forEach(r => {
    if (r.empty) return;
    r.metrics.details.forEach(d => {
      detailRows.push(`${csvEsc(r.name)},${csvEsc((d.sentence||'').replace(/\n/g,' '))},${d.role},${d.phase},${d.localCat},${d.refine},${d.aiRefined?1:0},${csvEsc(d.posWords)},${csvEsc(d.negWords)},${csvEsc(d.litWords)},${csvEsc(d.uncWords)},${r.metrics.Tone_P.toFixed(4)},${r.metrics.Tone_Q.toFixed(4)},${r.metrics.Tone_T.toFixed(4)}`);
    });
  });
  
  // Write Detail UTF-8 BOM
  fs.writeFileSync(detailOut, '\ufeff' + detailHdr + detailRows.join('\n'), 'utf-8');
  console.log(`Detail CSV written to: ${detailOut}`);

  console.log("\n=== ALL TASKS COMPLETED SUCCESSFULLY ===");
  console.log(`Processed: ${records.length} files.`);
  console.log(`AI analysis completed for: ${records.filter(r => r.aiUsed).length} files.`);
  console.log(`Summary Output Path: ${summaryOut}`);
  console.log(`Detail Output Path: ${detailOut}`);
}

run().catch(console.error);
