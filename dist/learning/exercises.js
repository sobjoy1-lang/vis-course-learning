import { getState, updateState } from './store.js';

// Every question links to a real section in the original course. Explanations
// are authored for this exercise bank; no network request or model is needed.
const question = (id, chapter, section, correct, zh, en) => ({
  id, chapter, section, correct,
  'zh-CN': { prompt: zh[0], options: zh[1], explanation: zh[2] },
  'en-US': { prompt: en[0], options: en[1], explanation: en[2] },
});

export const QUIZ_BANK = [
  question('ch1-q1', 1, 'ch-1-1', 1,
    ['本章的新生 CSV 是合成数据，下面哪种使用方式合适？',
      ['据此公布学校真实的性别比例', '标注“合成数据”，用于学习加载与转换', '据此识别真实学生身份', '将其视为全国新生的随机样本'],
      '合成数据适合演示数据处理，但姓名、籍贯及其分布不能当作真实统计结论。使用时应明确标注数据来源。'],
    ['The student CSV is synthetic. Which use is appropriate?',
      ['Publish it as the university’s actual gender distribution', 'Label it synthetic and use it to learn loading and transformation', 'Identify real students from the records', 'Treat it as a random sample of all first-year students'],
      'Synthetic records can support teaching, but invented identities and distributions do not establish real demographic facts. State the data source explicitly.']),
  question('ch1-q2', 1, 'ch-1-2', 2,
    ['把一组原始年龄整理为“各班平均年龄表”，主要对应 DIKW 的哪一层？',
      ['智慧 Wisdom', '原始数据 Data', '信息 Information', '决策战略'],
      '平均年龄表是经过组织和处理、带有班级上下文的数据，属于信息。进一步解释规律属于知识，运用规律作决策才涉及智慧。'],
    ['A table of average age by class is calculated from raw ages. Which DIKW level does it primarily represent?',
      ['Wisdom', 'Raw data', 'Information', 'Decision strategy'],
      'The table organizes and processes data with class context, so it represents information. Explaining patterns develops knowledge; applying knowledge to decisions involves wisdom.']),
  question('ch1-q3', 1, 'ch-1-3', 0,
    ['“专业名称”（如软件工程、计算机科学）属于哪类属性？',
      ['类别型：类别之间没有自然大小顺序', '序数型：必须按高低排名', '比率型：可以计算两个专业名称的比值', '区间型：相邻专业的差值固定'],
      '专业名称用于区分类别，没有自然数量差值或大小顺序。编码时可以用离散色相区分，不应让颜色深浅暗示专业高低。'],
    ['What type of attribute is a major name, such as Software Engineering or Computer Science?',
      ['Categorical: the categories have no inherent ranking', 'Ordinal: the majors must be ranked', 'Ratio: ratios between major names are meaningful', 'Interval: adjacent majors have a fixed difference'],
      'Major names distinguish categories without numeric distances or an inherent order. Discrete hues can distinguish them; lightness should not imply a ranking.']),
  question('ch1-q4', 1, 'ch-1-4', 3,
    ['要直接得到“每个班有多少人”，下面哪个操作最合适？',
      ['d3.group(data, d => d.class)', 'd3.filter(data, d => d.class)', 'd3.pairs(data)', 'd3.rollup(data, rows => rows.length, d => d.class)'],
      'rollup 会先按班级分组，再把每组归约成人数。group 保留每组的原始记录，需要再计算组内长度，才得到人数。'],
    ['Which operation directly produces a student count for each class?',
      ['d3.group(data, d => d.class)', 'd3.filter(data, d => d.class)', 'd3.pairs(data)', 'd3.rollup(data, rows => rows.length, d => d.class)'],
      'rollup groups records by class and reduces each group to its length. group retains the original records in each group and requires an additional counting step.']),
  question('ch1-q5', 1, 'ch-1-5', 1,
    ['按稳定的字母 key 绑定数据：旧数据 [A, B] 变为 [B, C]，三态如何分配？',
      ['A 更新，B 进入，C 退出', 'B 更新，C 进入，A 退出', 'A、B 都更新，没有进入和退出', '全部旧节点退出，全部新节点进入'],
      'key 决定节点身份。B 在新旧数据中都存在，进入 update；C 是新增 key，进入 enter；A 已消失，进入 exit。不能只用数组长度判断三态。'],
    ['With stable letter keys, old data [A, B] becomes [B, C]. Which join states apply?',
      ['A updates, B enters, C exits', 'B updates, C enters, A exits', 'A and B update; nothing enters or exits', 'All old nodes exit and all new nodes enter'],
      'Keys determine identity. B exists in both sets and updates; C enters; A exits. Array length alone does not determine the three states.']),

  question('ch2-q1', 2, 'ch-2-1', 0,
    ['下面哪条链路符合本章演示的数据可视化流程？',
      ['原始数据 → 数据变换 → 视觉映射 → 视图渲染 → 用户交互', '视图渲染 → 原始数据 → 用户交互 → 数据变换', '原始数据 → 用户交互，省略映射与渲染', '先任意画图，最后再决定数值含义'],
      '流程图先处理数据，再将数据属性映射到视觉通道，生成视图并支持交互。交互也可以反馈到前面的变换和参数步骤。'],
    ['Which sequence matches this chapter’s visualization pipeline?',
      ['Raw data → transformation → visual mapping → rendering → interaction', 'Rendering → raw data → interaction → transformation', 'Raw data → interaction, omitting mapping and rendering', 'Draw arbitrary shapes first and assign meaning afterward'],
      'Transform the data, map its attributes to visual channels, render a view, and support interaction. Interaction can feed back into earlier transformations and parameters.']),
  question('ch2-q2', 2, 'ch-2-2', 2,
    ['d3.rollup(data, v => v.length, d => d.major, d => d.class) 的含义是什么？',
      ['按年龄排序后只取第一人', '先按班级、再按专业分组，保存姓名', '先按专业、再按班级分组，叶子值为人数', '把所有学生直接画成散点'],
      'rollup 中的 key 函数按书写顺序确定分组层次；v => v.length 将最内层每组记录归约为数量。'],
    ['What does d3.rollup(data, v => v.length, d => d.major, d => d.class) produce?',
      ['The youngest student after sorting by age', 'Groups by class, then major, storing names', 'Groups by major, then class, with student counts at the leaves', 'A rendered scatterplot of all students'],
      'The key functions specify grouping levels in their written order. The reducer v => v.length converts each innermost group to a count.']),
  question('ch2-q3', 2, 'ch-2-2', 1,
    ['练习数据只有3条，班级依次为 [软件1班, 软件1班, 计算机1班]。按班级 count 聚合后，“软件1班”的值是多少？',
      ['1', '2', '3', '保存全部3条记录的数组'],
      'count 聚合计算该组包含的记录数。“软件1班”有2条，所以结果为2；另一个班级的1条记录不会计入这一组。'],
    ['A practice dataset has three classes: [Software 1, Software 1, Computing 1]. After grouping by class and counting, what is the value for Software 1?',
      ['1', '2', '3', 'An array containing all three records'],
      'A count reducer returns the number of records in that group. Software 1 contains two records; the Computing 1 record belongs to a different group.']),
  question('ch2-q4', 2, 'ch-2-3', 3,
    ['在 d3.hierarchy 建立层级结构后，d3.tree() 主要继续做什么？',
      ['把 CSV 的所有文字翻译成英文', '把每个节点变成平均年龄', '自动判断每名学生的真实专业', '为树节点计算布局坐标，供绘制节点和连线'],
      'hierarchy 表示父子关系，tree 根据层级、画布尺寸及间距规则计算节点坐标；之后再用 SVG 图形和路径将布局画出来。'],
    ['After d3.hierarchy builds the hierarchy, what does d3.tree() primarily do?',
      ['Translate every CSV string into English', 'Replace every node with an average age', 'Infer each student’s actual major', 'Compute node layout coordinates for drawing nodes and links'],
      'hierarchy represents parent–child relationships. tree uses the hierarchy, layout size, and separation rules to compute coordinates; SVG elements then render the layout.']),
  question('ch2-q5', 2, 'ch-2-4', 0,
    ['点击树形列表的折叠按钮时，event.stopPropagation() 的作用是什么？',
      ['阻止本次点击继续向祖先元素传播', '自动删除所有子节点的数据', '禁止页面上所有按钮继续工作', '将动画时长设置为0'],
      'stopPropagation 控制事件传播，可防止一次折叠操作顺带触发祖先元素的点击处理。它不会自动改变数据，也不等同于取消浏览器默认行为。'],
    ['When a tree-list collapse control is clicked, what does event.stopPropagation() do?',
      ['Stop that click from propagating to ancestor elements', 'Delete all child-node data automatically', 'Disable every button on the page', 'Set the transition duration to zero'],
      'stopPropagation controls event propagation, helping prevent a collapse click from also triggering ancestor click handlers. It neither modifies data nor cancels a browser default action by itself.']),

  question('ch3-q1', 3, 'ch-3-1', 2,
    ['为了让颜色插值的变化更接近人的感知，下面哪个空间比直接使用 RGB 更合适？',
      ['仅把 RGB 数值放大10倍', '把所有颜色都改为纯红', 'CIE Lab', '把 RGB 三个通道顺序颠倒'],
      'Lab 的设计目标是让色彩距离更接近感知差异，适合进行感知层面的颜色插值。实际使用仍需检查显示色域与色觉可访问性。'],
    ['Which option is more suitable than direct RGB interpolation when seeking changes closer to human perception?',
      ['Multiply every RGB value by ten', 'Replace every color with pure red', 'CIE Lab', 'Reverse the order of the RGB channels'],
      'Lab is designed so color distances more closely reflect perceptual differences. Still check the display gamut and color-vision accessibility of the resulting palette.']),
  question('ch3-q2', 3, 'ch-3-2', 1,
    ['展示“温度相对常年平均值的偏差”，0表示无偏差，正负都重要，应优先考虑哪类色图？',
      ['定性型，因为正负值完全无序', '发散型，以0作为有意义的中点', '随机颜色，每天一个色相', '仅用一种固定颜色，忽略数值'],
      '存在有意义的中点时，发散色图可用中间浅色表示接近0、两端颜色表示正负方向。中点应来自数据语义，而非随意选择。'],
    ['For temperature anomalies where zero means the long-term average and both signs matter, which colormap type is appropriate?',
      ['Qualitative, because positive and negative values are unordered', 'Diverging, centered on the meaningful zero', 'A random hue for every day', 'One fixed color that ignores the values'],
      'A diverging map can show values near zero with a light center and distinguish positive and negative directions at its ends. The center should have a meaningful data interpretation.']),
  question('ch3-q3', 3, 'ch-3-2', 3,
    ['四个没有先后排名的产品类别需要用颜色区分，应选择什么？',
      ['按数值大小变化的顺序型色图', '以0为中心的发散型色图', '给所有类别相同的灰色且不加标签', '用离散色相区分类别的定性型配色'],
      '定性配色表达类别差异，不额外暗示大小或顺序。顺序型和发散型适合有相应数值语义的数据。'],
    ['Four product categories have no inherent ranking. Which color scheme fits this task?',
      ['A sequential map that implies increasing values', 'A diverging map centered on zero', 'Identical gray for every category without labels', 'A qualitative palette with distinct category hues'],
      'Qualitative palettes distinguish categories without implying magnitude or order. Sequential and diverging maps serve data with those numeric semantics.']),
  question('ch3-q4', 3, 'ch-3-4', 0,
    ['在色轮上，一对互补色的色相通常相差多少？',
      ['180°', '30°', '60°', '0°'],
      '互补配色选取色轮相对位置的色相，通常相差180°。它能形成较强对比，但仍要控制饱和度并检查可读性。'],
    ['On a hue wheel, what is the usual hue difference between complementary colors?',
      ['180°', '30°', '60°', '0°'],
      'Complementary colors occupy opposite positions on the hue wheel, normally 180° apart. They can provide strong contrast, but saturation and readability still need care.']),
  question('ch3-q5', 3, 'ch-3-8', 2,
    ['散点图的两个类别在色觉缺陷模拟中难以区分，哪种改进更可靠？',
      ['只把图例字体缩小', '仅声称配色很鲜艳，不再检查', '增加形状或文字标签，并重新检查颜色与亮度差异', '删除所有类别说明'],
      '颜色之外的形状、标签和亮度差异能提供重复线索。应再检查模拟效果，让读者不必仅依赖色相识别类别。'],
    ['Two scatterplot categories are hard to distinguish in a color-vision simulation. Which improvement is more reliable?',
      ['Only reduce the legend font size', 'Declare the colors vivid and stop checking', 'Add shapes or labels, then recheck color and lightness differences', 'Remove every category label'],
      'Shapes, labels, and lightness differences provide additional cues. Recheck the result so readers do not have to rely on hue alone to identify categories.']),

  question('ch4-q1', 4, 'ch-4-1', 1,
    ['把一行 {state, murder, robbery} 转成长格式，哪种记录结构正确？',
      ['每个州保留一行，继续增加指标列', '每个“州×指标”一行：{state, metric, value}', '仅留下州名，删除所有数值', '把所有州合成一个字符串'],
      '长格式将指标名变为 metric 字段，将该指标数值放到 value 字段。这样可以按指标过滤、分组，并统一绑定图形。'],
    ['When converting {state, murder, robbery} from wide to long format, which record structure is appropriate?',
      ['Keep one row per state and continue adding metric columns', 'Use one row per state–metric pair: {state, metric, value}', 'Keep only state names and delete the values', 'Join every state into one string'],
      'Long format puts the metric name in a metric field and its numeric measurement in value. This supports filtering, grouping, and consistent graphical binding.']),
  question('ch4-q2', 4, 'ch-4-2', 3,
    ['一组正数人口数据跨越多个数量级，希望减轻极大值挤压其他数据的情况，应考虑什么比例尺？',
      ['scaleBand，把每个数值当成无序名称', '固定返回同一个像素的比例尺', '直接把人口字符串当作坐标', 'scaleLog，并检查定义域适合对数变换'],
      '对数比例尺适合跨数量级的正值数据，可以压缩大值间距。对数变换不能直接用于包含0的定义域；本题已限定为正数。'],
    ['Positive population values span several orders of magnitude. Which scale can reduce the visual compression of smaller values?',
      ['scaleBand, treating every number as an unordered name', 'A scale that always returns the same pixel', 'Use population strings directly as coordinates', 'scaleLog, after checking that the domain suits a log transform'],
      'A logarithmic scale can compress large-value spacing when positive values span orders of magnitude. Its domain cannot include zero; this question explicitly uses positive values.']),
  question('ch4-q3', 4, 'ch-4-3', 0,
    ['关于“插值”和“拟合”，哪项描述正确？',
      ['插值经过给定数据点；拟合侧重整体趋势，不必经过每个点', '拟合必须经过每个数据点', '任何平滑曲线都能证明因果关系', '只要曲线漂亮，就无需检查原始数据'],
      '本节区分经过数据点的插值与概括趋势的拟合，例如线性回归通常不经过所有样本点。视觉平滑也不代表数据更准确。'],
    ['Which statement correctly distinguishes interpolation from fitting?',
      ['Interpolation passes through the given points; fitting summarizes a trend and need not pass through every point', 'A fitted curve must pass through every data point', 'Any smooth curve proves a causal relationship', 'An attractive curve removes the need to inspect the data'],
      'The section distinguishes interpolation through data points from trend fitting. A regression line generally does not pass through every sample; visual smoothness does not establish accuracy.']),
  question('ch4-q4', 4, 'ch-4-4', 2,
    ['在横纵单位显示长度相同的情况下，一条上升线段的 Δx = Δy，其倾角是多少？',
      ['0°', '90°', '45°', '无法判断，必须知道线条颜色'],
      '当横纵单位的显示长度相同时，斜率为 Δy/Δx = 1，所以倾角 arctan(1) = 45°。若横纵轴缩放不同，屏幕上的倾角也会变化。'],
    ['With equal displayed lengths for the horizontal and vertical units, a rising segment has Δx = Δy. What is its angle?',
      ['0°', '90°', '45°', 'It cannot be determined without the line color'],
      'With equal display scaling, the slope is Δy/Δx = 1, giving arctan(1) = 45°. Different horizontal and vertical scaling would change its screen angle.']),
  question('ch4-q5', 4, 'ch-4-5', 1,
    ['Marching Squares 中，网格单元4个角各自只有“高于阈值/不高于阈值”两种状态，共有多少种角点配置？',
      ['4', '16', '8', '256'],
      '4个二值角点共有 2⁴ = 16 种配置，对应编号0到15。256种来自三维立方体8个角的 2⁸，不是二维方格。'],
    ['In Marching Squares, each of four corners is either above the threshold or not. How many corner configurations are possible?',
      ['4', '16', '8', '256'],
      'Four binary corners give 2⁴ = 16 configurations, numbered 0–15. The value 256 comes from the eight binary corners of a 3D cube, not a 2D square.']),

  question('ch5-q1', 5, 'ch-5-1', 3,
    ['“每天昼夜交替、每年季节变化”主要体现时间的什么属性？',
      ['时间没有顺序', '时间必须与空间混在一起', '所有时间点的数值都相同', '周期性'],
      '昼夜和季节会按一定节律反复出现，体现周期性。选择可视化时应区分长期趋势与周期内变化。'],
    ['Day–night cycles and recurring seasons primarily illustrate which property of time?',
      ['Time has no order', 'Time must always be combined with space', 'All timestamps have identical values', 'Cyclicity'],
      'Day–night and seasonal patterns recur at regular intervals. Visualization design should distinguish long-term trends from within-cycle variation.']),
  question('ch5-q2', 5, 'ch-5-2', 0,
    ['标准时间折线图通常如何编码数据？',
      ['横轴表示按先后排列的时间，纵轴表示度量值', '横轴随机排列日期，纵轴只写类别名称', '颜色必须为每一天分配一个独特色相', '所有年份都放在同一个横坐标'],
      '标准时序图通常将时间映射到横轴、度量映射到纵轴，用线展示随时间变化的趋势。连线前要保证记录按时间顺序组织。'],
    ['How does a standard time-series line chart usually encode data?',
      ['Chronologically ordered time on x, measured values on y', 'Randomly ordered dates on x, category names only on y', 'A unique hue is required for every day', 'Every year uses the same x coordinate'],
      'A standard time-series chart maps time to x and a measurement to y, connecting observations to show change. Organize records chronologically before drawing the line.']),
  question('ch5-q3', 5, 'ch-5-3', 2,
    ['本章的日历热图用什么方式展示每日温度？',
      ['横轴为学生，纵轴为班级，颜色为姓名', '只用圆的半径表示年份，不保留日期', '横向按周、纵向按星期几布局，用颜色表示温度', '把所有温度求和后只画一个格子'],
      '日历热图把每天放入对应的周和星期位置，再将温度映射为颜色，便于观察星期、月份等周期结构及异常日期。'],
    ['How does this chapter’s calendar heatmap encode daily temperature?',
      ['Students on x, classes on y, names as colors', 'Only circle radius represents the year; dates are discarded', 'Weeks horizontally, weekdays vertically, and temperature as color', 'Sum every temperature and draw a single cell'],
      'Each day occupies its week and weekday position, with temperature mapped to color. This helps reveal weekly and monthly structures and unusual dates.']),
  question('ch5-q4', 5, 'ch-5-4', 1,
    ['阿基米德螺旋的半径 r 与角度 θ 的关系是哪一个？',
      ['r = a / θ，且θ可以任意为0', 'r = a + bθ', 'r 必须始终等于0', 'r 与θ毫无关系，必须随机生成'],
      '阿基米德螺旋满足 r = a + bθ，半径随角度线性增长。本节利用螺旋的循环结构表达周期时间，同时保留向外展开的时间顺序。'],
    ['Which equation describes the radius r of an Archimedean spiral as a function of angle θ?',
      ['r = a / θ, allowing θ = 0 without restriction', 'r = a + bθ', 'r must always equal zero', 'r has no relationship to θ and must be random'],
      'For an Archimedean spiral, r = a + bθ: radius increases linearly with angle. The chapter uses its repeating turns to represent cycles while retaining outward temporal order.']),
  question('ch5-q5', 5, 'ch-5-5', 3,
    ['Storyline 时间线中，两个角色的线在某个时段靠近，通常用来表达什么？',
      ['两个角色的年龄一定完全相同', '图中时间开始倒流', '该时段所有事件都不存在', '角色在该时段发生相遇、互动或共同事件'],
      'Storyline 用线表示角色，线的靠近或聚集表达相遇、互动，分开表达分离。具体事件仍需结合事件层、文字或提示阅读。'],
    ['In a storyline, what does bringing two character lines together during an interval usually express?',
      ['The two characters must have the same age', 'Time starts moving backward', 'No event exists during that interval', 'The characters meet, interact, or share an event'],
      'Lines represent characters. Their proximity or grouping encodes meetings and interactions; separation encodes parting. Event marks and text provide the particular narrative context.']),
];

const courseRoot = new URL('../', import.meta.url);
const instances = new WeakMap();
let nextInstance = 0;
const chapterTitles = {
  'zh-CN': ['数据', '数据可视化流程', '色彩专题', '低维可视化', '时序可视化'],
  'en-US': ['Data', 'Visualization Process', 'Color', 'Low-Dimensional Visualization', 'Time-Series Visualization'],
};

const styles = `
.vl-quiz{color:#1e293b;line-height:1.65;font-size:14px;text-align:left}
.vl-quiz *{box-sizing:border-box}
.vl-quiz h3{font-size:20px;margin:0 0 6px;color:#0f172a}
.vl-quiz-intro,.vl-quiz-summary{margin:6px 0 12px;color:#475569}
.vl-quiz-toolbar,.vl-quiz-actions{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:14px 0}
.vl-quiz select{max-width:100%;border:1px solid #cbd5e1;background:#fff;color:#0f172a;padding:8px 10px;border-radius:8px;font:inherit}
.vl-quiz-btn{border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;background:#fff;color:#334155;font:inherit;cursor:pointer;line-height:1.5}
.vl-quiz-btn:hover{background:#f1f5f9}.vl-quiz-btn-primary,.vl-quiz-btn[aria-pressed="true"]{color:#fff;background:#4f46e5;border-color:#4f46e5}
.vl-quiz-btn-primary:hover,.vl-quiz-btn[aria-pressed="true"]:hover{background:#4338ca}
.vl-quiz-btn:focus-visible,.vl-quiz select:focus-visible,.vl-quiz a:focus-visible{outline:3px solid #818cf8;outline-offset:3px}
.vl-quiz-card{min-width:0;margin:14px 0;padding:16px;border:1px solid #cbd5e1;border-radius:12px;background:#fff}
.vl-quiz-card legend{max-width:100%;padding:0 6px;font-weight:650;white-space:normal;overflow-wrap:anywhere;color:#0f172a}
.vl-quiz-card.vl-quiz-missing{border:2px solid #b91c1c}.vl-quiz-choices{display:grid;gap:8px}
.vl-quiz-choice{display:flex;gap:9px;align-items:flex-start;border:1px solid #e2e8f0;border-radius:8px;padding:10px;cursor:pointer;background:#f8fafc;overflow-wrap:anywhere}
.vl-quiz-choice:has(input:checked){border-color:#6366f1;background:#eef2ff}.vl-quiz-choice:has(input:focus-visible){outline:3px solid #818cf8;outline-offset:2px}
.vl-quiz-choice input{flex:none;width:16px;height:16px;margin:4px 0 0;accent-color:#4f46e5}
.vl-quiz-answer{margin:12px 0 0;padding:12px;border-radius:8px;background:#f0fdf4;border-left:3px solid #15803d}
.vl-quiz-answer.vl-quiz-incorrect{background:#fff7ed;border-left-color:#c2410c}
.vl-quiz-answer p{margin:5px 0 0}.vl-quiz-source{display:inline-block;margin-top:10px;color:#4338ca;text-decoration:underline;text-underline-offset:3px}
.vl-quiz-status{color:#334155;font-weight:600;min-height:1.65em;margin:8px 0}
.vl-quiz-status.vl-quiz-error{color:#b91c1c}.vl-quiz-empty{border:1px dashed #cbd5e1;border-radius:10px;padding:20px;color:#475569}
@media(max-width:520px){.vl-quiz-card{padding:12px}.vl-quiz-toolbar{align-items:stretch}.vl-quiz-toolbar label,.vl-quiz-toolbar select{width:100%}}
`;

/** Mount the course quiz. Returns a disposer; remounting a container is safe. */
export function mountQuiz(container, chapter, { lang = 'zh-CN' } = {}) {
  if (!container || typeof container.replaceChildren !== 'function') {
    throw new TypeError('mountQuiz requires a DOM container');
  }
  instances.get(container)?.();
  const locale = String(lang).toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
  const en = locale === 'en-US';
  const tr = (zh, english) => en ? english : zh;
  const requested = Number(chapter);
  const chooseChapter = !(requested >= 1 && requested <= 5 && Number.isInteger(requested));
  let current = chooseChapter ? 1 : requested;
  let mode = 'all';
  let wrongIds = [];
  let message = '';
  let messageIsError = false;
  let disposed = false;
  let writing = false;
  let lastQuizSnapshot = '';
  const drafts = new Map();
  const dirty = new Set();
  const missing = new Set();
  const instanceId = ++nextInstance;
  const doc = container.ownerDocument;
  const eventTarget = doc.defaultView || window;
  const root = doc.createElement('section');
  root.className = 'vl-quiz';
  root.setAttribute('aria-label', tr('章节练习', 'Chapter exercises'));
  container.replaceChildren(root);

  function node(tag, className, text) {
    const item = doc.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = String(text);
    return item;
  }
  const questions = () => QUIZ_BANK.filter(q => q.chapter === current);
  const saved = q => {
    const result = getState().quiz?.[q.chapter]?.[q.id];
    return result && Number.isInteger(result.answer) && result.answer >= 0 && result.answer < q[locale].options.length ? result : null;
  };
  function seedDrafts() {
    QUIZ_BANK.forEach(q => {
      if (!dirty.has(q.id)) {
        const result = saved(q);
        if (result) drafts.set(q.id, result.answer);
        else drafts.delete(q.id);
      }
    });
  }
  function visibleQuestions() {
    return questions().filter(q => mode === 'all' || wrongIds.includes(q.id));
  }
  const currentMistakes = () => questions().filter(q => {
    const result = saved(q);
    return result && result.answer !== q.correct;
  });
  function button(text, action, primary = false) {
    const item = node('button', `vl-quiz-btn${primary ? ' vl-quiz-btn-primary' : ''}`, text);
    item.type = 'button';
    item.addEventListener('click', action);
    return item;
  }
  function status(text, error = false) {
    message = text;
    messageIsError = error;
  }
  function submit(event) {
    event.preventDefault();
    const shown = visibleQuestions();
    if (!shown.length) return;
    missing.clear();
    shown.forEach(q => { if (!drafts.has(q.id)) missing.add(q.id); });
    if (missing.size) {
      status(tr(`还有 ${missing.size} 题未作答，请完成后再提交。`, `${missing.size} question(s) unanswered. Answer them before submitting.`), true);
      render();
      const first = root.querySelector('.vl-quiz-missing input');
      first?.focus({ preventScroll: true });
      first?.closest('fieldset')?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const at = Date.now();
    let correctCount = 0;
    writing = true;
    try {
      updateState(state => {
        state.quiz ||= {};
        state.quiz[current] ||= {};
        shown.forEach(q => {
          const answer = drafts.get(q.id);
          const correct = answer === q.correct;
          if (correct) correctCount++;
          state.quiz[current][q.id] = { answer, correct, at };
        });
      });
      shown.forEach(q => dirty.delete(q.id));
      status(tr(`已提交：本次答对 ${correctCount}/${shown.length} 题。逐题解析已展开。`, `Submitted: ${correctCount}/${shown.length} correct. Explanations are shown below.`));
    } catch (error) {
      status(tr('成绩暂时无法保存，请重试。当前选择仍保留在本页。', 'Results could not be saved. Please retry; your current choices remain on this page.'), true);
    } finally {
      writing = false;
    }
    render();
  }
  function restart() {
    visibleQuestions().forEach(q => { drafts.delete(q.id); dirty.add(q.id); });
    missing.clear();
    status(tr('已开始重新作答；提交后将更新这些题目的成绩。', 'Ready to try again. Submitting will update the results for these questions.'));
    render();
  }

  function render() {
    if (disposed) return;
    const focusedId = root.contains(doc.activeElement) ? doc.activeElement.id : '';
    const fragment = doc.createDocumentFragment();
    const style = node('style');
    style.textContent = styles;
    fragment.append(style, node('h3', '', tr('章节练习', 'Chapter exercises')));
    fragment.append(node('p', 'vl-quiz-intro', tr('每章 5 题。选择答案后点击“提交并查看解析”判分；可以筛选错题、回看知识点并重新作答。', 'Five questions per chapter. Choose answers and submit to see results and explanations. Filter mistakes, revisit the lesson, and try again.')));

    if (chooseChapter) {
      const toolbar = node('div', 'vl-quiz-toolbar');
      const label = node('label', '', tr('选择章节 ', 'Choose chapter '));
      const select = node('select');
      select.id = `vl-quiz-${instanceId}-chapter`;
      chapterTitles[locale].forEach((title, index) => {
        const option = node('option', '', `${index + 1}. ${title}`);
        option.value = String(index + 1);
        option.selected = current === index + 1;
        select.append(option);
      });
      select.addEventListener('change', () => {
        current = Number(select.value);
        mode = 'all';
        wrongIds = [];
        missing.clear();
        status('');
        render();
      });
      label.append(select);
      toolbar.append(label);
      fragment.append(toolbar);
    } else {
      fragment.append(node('p', 'vl-quiz-summary', `${tr('第', 'Chapter ')}${current}${tr('章 · ', ' · ')}${chapterTitles[locale][current - 1]}`));
    }

    const chapterQuestions = questions();
    const checked = chapterQuestions.filter(q => saved(q));
    const correct = checked.filter(q => saved(q).answer === q.correct);
    const wrong = currentMistakes();
    fragment.append(node('p', 'vl-quiz-summary', tr(
      `本章已提交 ${checked.length}/5 题 · 答对 ${correct.length} 题 · 错题 ${wrong.length} 题`,
      `Submitted ${checked.length}/5 · Correct ${correct.length} · Mistakes ${wrong.length}`,
    )));
    const toolbar = node('div', 'vl-quiz-toolbar');
    const allButton = button(tr('全部题目', 'All questions'), () => {
      mode = 'all'; missing.clear(); status(''); render();
    });
    allButton.setAttribute('aria-pressed', String(mode === 'all'));
    const wrongButton = button(tr(`只看错题（${wrong.length}）`, `Mistakes only (${wrong.length})`), () => {
      mode = 'wrong'; wrongIds = currentMistakes().map(q => q.id); missing.clear(); status(''); render();
    });
    wrongButton.setAttribute('aria-pressed', String(mode === 'wrong'));
    toolbar.append(allButton, wrongButton);
    fragment.append(toolbar);

    const feedback = node('p', `vl-quiz-status${messageIsError ? ' vl-quiz-error' : ''}`, message);
    feedback.id = `vl-quiz-${instanceId}-status`;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    fragment.append(feedback);
    const shown = visibleQuestions();
    if (!shown.length) {
      fragment.append(node('p', 'vl-quiz-empty', tr('本章暂无错题。先完成并提交全部题目，答错的题目会出现在这里。', 'No saved mistakes in this chapter. Submit all questions first; any incorrect answers will appear here.')));
    } else {
      if (mode === 'wrong') fragment.append(node('p', 'vl-quiz-summary', tr('本轮显示筛选时的错题；提交后可查看订正解析，再点击“只看错题”刷新列表。', 'This attempt keeps the mistakes selected by the filter. After submitting, read the explanations and click “Mistakes only” again to refresh.')));
      const form = node('form');
      form.noValidate = true;
      form.addEventListener('submit', submit);
      shown.forEach(q => {
        const content = q[locale];
        const number = chapterQuestions.indexOf(q) + 1;
        const card = node('fieldset', `vl-quiz-card${missing.has(q.id) ? ' vl-quiz-missing' : ''}`);
        card.id = `vl-quiz-${instanceId}-${q.id}`;
        card.append(node('legend', '', `${number}. ${content.prompt}`));
        const options = node('div', 'vl-quiz-choices');
        content.options.forEach((option, index) => {
          const label = node('label', 'vl-quiz-choice');
          const input = node('input');
          input.type = 'radio';
          input.name = `vl-quiz-${instanceId}-${q.id}`;
          input.id = `vl-quiz-${instanceId}-${q.id}-${index}`;
          input.value = String(index);
          input.checked = drafts.get(q.id) === index;
          if (missing.has(q.id)) input.setAttribute('aria-invalid', 'true');
          input.addEventListener('change', () => {
            drafts.set(q.id, index);
            dirty.add(q.id);
            missing.delete(q.id);
            status(tr('答案已选择，点击“提交并查看解析”后判分。', 'Answer selected. Submit to check this attempt.'));
            render();
          });
          label.append(input, node('span', '', `${String.fromCharCode(65 + index)}. ${option}`));
          options.append(label);
        });
        card.append(options);
        const result = saved(q);
        if (result && !dirty.has(q.id) && drafts.get(q.id) === result.answer) {
          const isCorrect = result.answer === q.correct;
          const answer = node('div', `vl-quiz-answer${isCorrect ? '' : ' vl-quiz-incorrect'}`);
          answer.append(node('strong', '', tr(isCorrect ? '✓ 回答正确' : '✗ 回答有误', isCorrect ? '✓ Correct' : '✗ Incorrect')));
          answer.append(node('p', '', tr(`正确答案：${String.fromCharCode(65 + q.correct)}. ${content.options[q.correct]}`, `Correct answer: ${String.fromCharCode(65 + q.correct)}. ${content.options[q.correct]}`)));
          answer.append(node('p', '', content.explanation));
          card.append(answer);
        }
        const sectionNumber = q.section.replace('ch-', '').replace('-', '.');
        const source = node('a', 'vl-quiz-source', tr(`回看知识点 ${sectionNumber} ↗`, `Review section ${sectionNumber} ↗`));
        source.href = new URL(`lesson-${String(q.chapter).padStart(2, '0')}/#${q.section}`, courseRoot).href;
        source.target = '_blank';
        source.rel = 'noopener';
        card.append(source);
        form.append(card);
      });
      const actions = node('div', 'vl-quiz-actions');
      const submitButton = button(tr('提交并查看解析', 'Submit and view explanations'), () => {}, true);
      submitButton.type = 'submit';
      actions.append(submitButton, button(tr('重新作答', 'Try again'), restart));
      form.append(actions);
      fragment.append(form);
    }
    root.replaceChildren(fragment);
    lastQuizSnapshot = JSON.stringify(getState().quiz || {});
    if (focusedId) doc.getElementById(focusedId)?.focus({ preventScroll: true });
  }

  function onStateChange() {
    if (writing || disposed || lastQuizSnapshot === JSON.stringify(getState().quiz || {})) return;
    seedDrafts();
    render();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    eventTarget.removeEventListener('vis-learning-change', onStateChange);
    if (instances.get(container) === dispose) instances.delete(container);
    root.remove();
  }
  instances.set(container, dispose);
  eventTarget.addEventListener('vis-learning-change', onStateChange);
  seedDrafts();
  render();
  return dispose;
}
