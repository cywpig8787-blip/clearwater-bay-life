import {plain} from './catalog.mjs';
// Families coordinate garments, colors, footwear and accessories only.
const family=(id,label,palette,shoes,accessory)=>({id,label,palette:plain(palette),shoes:plain(shoes),accessory:[{label:'不加配件',weight:3,count:0},...plain(accessory,{count:1})]});
export const families=[
 family('casual','日常休閒','米白＋靛藍|炭灰＋白|海軍藍＋淺灰|灰綠＋米白','低筒帆布鞋|素色球鞋|麂皮休閒鞋','帆布肩包|細帶腕錶|素色棒球帽|小型斜背包'),
 family('preppy','學院','海軍藍＋米白|棕＋米白＋酒紅|深綠＋淺灰|灰藍＋奶油白','樂福鞋|牛津鞋|低筒皮革球鞋','細皮帶|細框眼鏡|小胸針|針織領帶'),
 family('minimal','極簡','黑＋霧灰|米白＋灰棕|海軍藍＋白|砂色＋淺灰','素面樂福鞋|素色球鞋|素面短靴','幾何細戒|細帶腕錶|小型素面肩包|細金屬手環'),
 family('romantic','柔和細節','奶油白＋煙粉|鼠尾草綠＋米白|霧藍＋柔棕|米杏＋灰紫','繫帶平底鞋|搭扣平底鞋|圓頭短靴','小花別針|小型珍珠耳釘|細緞帶胸針|小型圓角肩包'),
 family('sport','運動剪裁','白＋海軍藍|草綠＋米白|酒紅＋灰|灰藍＋黑','復古訓練鞋|素色跑鞋|網面運動鞋','運動腕錶|素色棒球帽|尼龍斜背小包|織帶手環'),
 family('street','街頭','靛藍＋白|炭灰＋橄欖綠|黑＋霧藍|淺灰＋深紅','滑板鞋|高筒球鞋|厚底帆布鞋','短金屬項鍊|小圈耳飾|織標斜背包|素色漁夫帽'),
 family('vintage','復古','芥末黃＋棕|磚紅＋奶油白|墨綠＋米杏|灰藍＋深棕','復古繫帶鞋|圓頭短靴|低筒帆布鞋','窄絲巾|小型皮革肩包|圓面腕錶|小型橢圓胸針'),
 family('tailored','剪裁','炭灰＋霧藍|海軍藍＋米白|駝色＋奶油白|深棕＋淺灰','繫帶皮鞋|素面短靴|樂福鞋','領帶夾|窄皮帶|小領巾|細帶腕錶'),
 family('work','工裝','軍綠＋沙色|靛藍＋棕|鐵灰＋米白|陶土棕＋深藍','繫帶工作靴|厚底帆布鞋|麂皮短靴','窄帆布腰帶|小型帆布包|素面腕錶|小型金屬吊牌'),
 family('outdoor','機能','苔綠＋沙色|黑＋霧灰|海軍藍＋灰藍|深棕＋米杏','低筒機能鞋|越野式球鞋|繫帶步行鞋','尼龍腰包|輕量腕錶|素色軟帽|小型尼龍背包'),
 family('dark','暗色','黑＋炭灰|墨綠＋黑|深紫＋灰黑|黑＋酒紅','黑色繫帶靴|銀扣短靴|黑色帆布鞋','古銀色小吊墜|小型金屬胸針|小圈耳飾|窄絨帶頸飾'),
 family('natural','棉麻','米白＋苔綠|亞麻米＋柔棕|灰綠＋米杏|灰藍＋奶油白','帆布鞋|麂皮繫帶鞋|素面平底鞋','小型織布包|木珠細手環|細布領巾|小葉形別針'),
 family('retrofuture','復古未來','霧銀＋白＋藍|灰紫＋深藍|黑＋銀灰|粉灰＋炭灰','銀灰球鞋|拼片球鞋|黑白高筒鞋','像素別針|小型透明肩包|幾何金屬耳釘|小型方形腕錶')
];
export const familyById=Object.fromEntries(families.map(f=>[f.id,f]));
const profile=(id,family,label,outfits)=>({id,family,label,weight:1,silhouette:plain(outfits)});
export const styles=[
 profile('casual','casual','Casual｜基本休閒','素 T＋直筒牛仔褲|棉襯衫＋卡其褲|衛衣＋棉質長褲|條紋上衣＋九分褲'),
 profile('normcore','casual','Normcore｜簡單基本款','圓領衛衣＋直筒牛仔褲|素色長袖 T＋平直長褲|開襟衫＋素 T＋直筒褲'),
 profile('denim','casual','Denim｜丹寧層次','丹寧外套＋素 T＋直筒褲|丹寧襯衫＋棉質寬褲|短丹寧外套＋A 字裙'),
 profile('coastal','casual','Coastal｜海岸休閒','開領棉襯衫＋及膝短褲|薄開襟衫＋條紋上衣＋長褲|棉麻罩衫＋直筒褲'),
 profile('preppy','preppy','Preppy｜學院','牛津襯衫＋針織背心＋卡其褲|格紋百褶裙＋素襯衫＋短開襟衫|Polo 衫＋直筒褲'),
 profile('ivy','preppy','Ivy｜常春藤剪裁','軟西裝＋牛津襯衫＋直筒褲|條紋襯衫＋細針織背心＋九分褲|短開襟衫＋襯衫＋及膝裙'),
 profile('dark-academia','preppy','Dark Academia｜深色學院','粗花呢外套＋高領針織＋長褲|背心＋襯衫＋百褶長裙|燈芯絨外套＋直筒褲'),
 profile('light-academia','preppy','Light Academia｜淺色學院','細針織背心＋襯衫＋卡其褲|棉質開襟衫＋長裙|薄西裝＋素襯衫＋寬褲'),
 profile('minimal','minimal','Minimalist｜極簡','箱形棉襯衫＋九分寬褲|素面短外套＋直筒褲|長背心＋素色上衣＋直筒裙'),
 profile('french','minimal','French Chic｜法式簡潔','條紋上衣＋直筒牛仔褲＋短外套|薄針織＋A 字裙|短開襟衫＋素 T＋高腰褲'),
 profile('scandi','minimal','Scandi｜寬鬆極簡','落肩針織＋寬鬆長褲|直線長外套＋素 T＋九分褲|箱形上衣＋直筒裙'),
 profile('clean','minimal','Clean Fit｜平整線條','俐落短外套＋合身 T＋直筒褲|襯衫＋有褲線的長褲|素面套頭針織＋九分褲'),
 profile('romantic','romantic','Romantic｜柔和領口','小荷葉領襯衫＋直筒長褲|細褶上衣＋A 字裙|圓領針織＋柔軟長裙'),
 profile('cottage','romantic','Cottage｜細碎花與棉布','細碎花襯衫＋棉質長褲|刺繡領片上衣＋長裙|薄針織背心＋棉襯衫＋寬褲'),
 profile('ribbon','romantic','Ribbon Detail｜緞帶細節','窄繫帶領襯衫＋直筒褲|小緞帶開襟衫＋及膝裙|袖口繫帶上衣＋簡單寬褲'),
 profile('sporty','sport','Sporty｜運動休閒','拼接運動外套＋棉質長褲|衛衣＋及膝短褲|運動 Polo＋束口褲'),
 profile('varsity','sport','Varsity｜棒球外套','棒球外套＋T-shirt＋牛仔褲|條紋 Rugby 上衣＋棉質長褲|短棒球外套＋百褶裙'),
 profile('tennis','sport','Tennis-inspired｜Polo 與細褶','Polo 衫＋百褶裙|針織背心＋Polo 衫＋直筒褲|拉鍊領運動衫＋及膝短褲'),
 profile('streetwear','street','Streetwear｜寬鬆街頭','寬 T＋工裝長褲|連帽衛衣＋寬腿牛仔褲|短外套＋長 T＋直筒褲'),
 profile('skate','street','Skate-inspired｜寬身層次','印花 T＋寬鬆斜紋褲|格紋襯衫＋素 T＋寬短褲|拉鍊帽衫＋直筒丹寧褲'),
 profile('utility-street','street','Utility Street｜口袋細節','短機能背心＋長袖 T＋直筒褲|多口袋襯衫＋寬褲|薄風衣＋寬短褲'),
 profile('vintage','vintage','Vintage｜復古混搭','花紋針織＋直筒褲|短燈芯絨外套＋襯衫＋牛仔褲|小格紋襯衫＋A 字裙'),
 profile('retro70','vintage','Seventies｜七〇年代剪裁','開領襯衫＋微喇叭長褲|細羅紋上衣＋高腰直筒褲|短麂皮外套＋素色長褲'),
 profile('retro90','vintage','Nineties｜九〇年代休閒','寬襯衫＋素 T＋直筒丹寧褲|短衛衣＋高腰牛仔褲|針織背心＋長袖 T＋寬褲'),
 profile('mod','vintage','Mod｜圓領與幾何線條','圓領針織＋窄直筒褲|短外套＋幾何裁片 A 字裙|Polo 針織＋九分褲'),
 profile('smart','tailored','Smart Casual｜俐落休閒','棉襯衫＋長褲＋軟西裝|薄針織＋西裝長褲|短套裝外套＋直筒裙'),
 profile('soft-tailoring','tailored','Soft Tailoring｜柔肩剪裁','柔肩外套＋開領襯衫＋寬褲|細針織＋有褲線的直筒褲|無領外套＋襯衫＋長褲'),
 profile('waistcoat','tailored','Waistcoat｜背心層次','西裝背心＋襯衫＋長褲|短背心＋細針織＋直筒褲|格紋背心＋素襯衫＋A 字裙'),
 profile('workwear','work','Workwear｜工裝','帆布工作外套＋素 T＋工裝褲|斜紋襯衫＋直筒丹寧褲|口袋背心＋長袖 T＋長褲'),
 profile('western','work','Western Detail｜西部剪裁細節','尖肩片襯衫＋直筒牛仔褲|麂皮短外套＋棉襯衫＋長褲|丹寧背心＋素 T＋直筒褲'),
 profile('gorpcore','outdoor','Gorpcore｜輕機能','薄防風外套＋直筒機能褲|抓絨背心＋棉襯衫＋長褲|短風衣＋素 T＋束口褲'),
 profile('techwear','outdoor','Techwear｜簡化機能剪裁','立領機能外套＋錐形長褲|短機能背心＋長袖上衣＋寬褲|連帽短外套＋直筒褲'),
 profile('soft-goth','dark','Soft Gothic｜暗色柔和線條','小立領襯衫＋直筒長褲|細蕾絲領口上衣＋長裙|短絨面外套＋素色長褲'),
 profile('punk-detail','dark','Punk Detail｜格紋與小金屬扣','格紋襯衫＋直筒丹寧褲|小金屬扣外套＋素 T＋長褲|補丁丹寧外套＋素色褲'),
 profile('rock','dark','Rock-inspired｜短外套與丹寧','短皮外套＋素 T＋牛仔褲|印花 T＋直筒長褲|短拉鍊外套＋細針織＋丹寧褲'),
 profile('linen','natural','Linen｜棉麻層次','棉麻襯衫＋寬鬆長褲|薄背心＋素面襯衫＋直筒裙|圓領亞麻上衣＋九分褲'),
 profile('mori','natural','Mori-inspired｜柔軟疊穿','薄針織背心＋棉襯衫＋長褲|棉麻長上衣＋直筒裙|圓領開襟衫＋寬褲'),
 profile('retro-future','retrofuture','Retro Future｜霧面拼片','幾何拼片短外套＋直筒褲|小像素印花 T＋寬褲|拼色拉鍊外套＋素色長褲'),
 profile('synth','retrofuture','Synth Palette｜低彩度拼色','霧色拼接外套＋素 T＋長褲|幾何圖案衛衣＋直筒褲|短立領外套＋寬褲')
];
styles.push(
 profile('nautical','casual','Nautical｜橫條紋與水手領','橫條紋上衣＋寬直筒褲|小水手領棉衫＋牛仔褲|短雙排扣外套＋素 T＋長褲'),
 profile('hoodie','casual','Hoodie Layering｜連帽層次','短外套＋薄連帽衫＋直筒褲|開襟衫＋素色帽 T＋牛仔褲|連帽衛衣＋短背心＋長褲'),
 profile('knit-casual','casual','Knit Casual｜針織休閒','圓領麻花針織＋直筒牛仔褲|半拉鍊針織＋棉質長褲|粗針開襟衫＋素 T＋九分褲'),
 profile('summer-cotton','casual','Summer Cotton｜短袖棉布','短袖箱形襯衫＋寬短褲|短袖圓領棉衫＋薄棉長褲|棉質短袖開襟衫＋及膝裙'),
 profile('argyle','preppy','Argyle｜菱格針織','菱格背心＋素襯衫＋直筒褲|菱格開襟衫＋素 T＋A 字裙|菱格套頭針織＋卡其褲'),
 profile('sailor-prep','preppy','Sailor Prep｜水手領學院','小水手領襯衫＋直筒長褲|海軍領外套＋圓領上衣＋百褶裙|雙排扣短外套＋針織＋九分褲'),
 profile('monochrome','minimal','Monochrome｜單色深淺','同色系箱形襯衫＋直筒褲|同色系薄針織＋A 字裙|同色系短外套＋素 T＋九分褲'),
 profile('longline','minimal','Longline｜長直線條','直線長外套＋素襯衫＋直筒褲|長背心＋長袖 T＋寬褲|及膝開襟衫＋圓領上衣＋長裙'),
 profile('cropped-layer','minimal','Cropped Layer｜短外層','短箱形外套＋長上衣＋直筒褲|短開襟衫＋高腰寬褲|短背心＋棉襯衫＋直筒裙'),
 profile('pleats','romantic','Soft Pleats｜細褶層次','細褶前襟襯衫＋平直長褲|小褶邊上衣＋及膝裙|柔軟開襟衫＋細褶長裙'),
 profile('lace-detail','romantic','Lace Detail｜局部蕾絲','細蕾絲領邊襯衫＋直筒褲|蕾絲袖口上衣＋A 字裙|蕾絲領片＋細針織＋長褲'),
 profile('prairie-detail','romantic','Prairie Detail｜圓領與小褶邊','圓領褶邊棉襯衫＋寬長褲|小碎花長袖上衣＋直筒裙|窄褶領口上衣＋棉質短外套＋長褲'),
 profile('track','sport','Track｜運動側條紋','立領運動夾克＋側條紋長褲|圓領衛衣＋側條紋束口褲|短拉鍊運動衫＋素色及膝短褲'),
 profile('rugby','sport','Rugby｜寬橫條紋','寬條紋翻領上衣＋直筒牛仔褲|素色外套＋Rugby 衫＋棉質短褲|短版寬條紋 Polo＋百褶裙'),
 profile('retro-basket','sport','Retro Court｜復古球場剪裁','寬鬆滾邊背心＋素 T＋及膝短褲|拼片衛衣＋直筒長褲|拉鍊外套＋寬身 T＋運動短褲'),
 profile('cargo','street','Cargo｜工裝口袋街頭','短寬 T＋寬腿工裝褲|口袋短背心＋長 T＋直筒褲|連帽短外套＋側袋短褲'),
 profile('layered-tee','street','Layered Tee｜長短袖疊穿','短袖印花 T＋素色長袖 T＋寬褲|薄短袖襯衫＋長袖上衣＋直筒褲|寬背心＋長袖 T＋工裝褲'),
 profile('corduroy','vintage','Corduroy｜燈芯絨','燈芯絨襯衫外套＋素 T＋牛仔褲|細條燈芯絨背心＋襯衫＋長褲|短燈芯絨外套＋A 字裙'),
 profile('retro-cardigan','vintage','Retro Cardigan｜復古開襟衫','提花開襟衫＋襯衫＋直筒褲|細條紋短開襟衫＋高腰褲|滾邊針織外套＋圓領上衣＋長裙'),
 profile('herringbone','tailored','Herringbone｜細人字紋','細人字紋外套＋素襯衫＋直筒褲|人字紋背心＋薄針織＋長褲|細紋短外套＋平直裙'),
 profile('chore','work','Chore Jacket｜工作夾克','三貼袋工作夾克＋素 T＋直筒褲|短帆布夾克＋薄針織＋牛仔褲|箱形工作襯衫＋寬腿長褲'),
 profile('safari-detail','work','Safari Detail｜翻領與貼袋','翻領四袋襯衫＋直筒褲|薄翻領夾克＋素 T＋寬短褲|腰帶短外套＋棉質長褲'),
 profile('parka','outdoor','Parka｜防風層次','中長連帽外套＋素 T＋直筒褲|短防風派克外套＋針織＋束口褲|薄連帽風衣＋襯衫＋九分褲'),
 profile('textured-linen','natural','Textured Linen｜棉麻織紋','細織紋棉麻上衣＋寬褲|薄編織背心＋棉襯衫＋長褲|粗織短外套＋素色長裙')
);
styles.find(s=>s.id==='monochrome').palette=plain('深灰＋淺灰|深棕＋淺棕|深藍＋灰藍|米白＋奶油白');
// Narrow substyle palettes so their names always match the rendered clothes.
for(const s of styles){
 if(s.id==='dark-academia')s.palette=plain('深棕＋米白＋黑|深棕＋酒紅|炭灰＋深綠');
 if(s.id==='light-academia')s.palette=plain('奶油白＋卡其|米白＋淺棕|米杏＋霧藍');
}
export const styleOptions=(s,field)=>s?.[field]||familyById[s?.family]?.[field]||[];
