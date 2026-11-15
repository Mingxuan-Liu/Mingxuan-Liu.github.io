// The volume data, camera and transfer functions are identical in both editions.
const chinese = document.documentElement.lang.startsWith('zh');
const choose = (english, translation) => chinese ? translation : english;
export const locale = choose('en-US', 'zh-CN');

const chineseFields = {
  number_density: ['粒子数密度', 'log₁₀ n [cm⁻³]'],
  temperature: ['温度', 'log₁₀ T [K]'],
  plasma_beta: ['等离子体比压 β', 'log₁₀ β = log₁₀ (气体热压 / 磁压)'],
  halpha: ['Hα 体积发射率', 'log₁₀ ε(Hα) [erg cm⁻³ s⁻¹]'],
  ohmic_heating: ['欧姆加热率', 'log₁₀ Q [erg cm⁻³ s⁻¹]'],
  viscous_heating: ['黏性加热率', 'log₁₀ Q [erg cm⁻³ s⁻¹]'],
};

export function localizeField(field) {
  if (!chinese) return field;
  const [title, label] = chineseFields[field.key];
  return { ...field, title, label };
}

export const copy = {
  opening: choose('Opening the 3D viewer…', '正在打开三维视图…'),
  requiresWebGL: choose(
    'This viewer requires WebGL2. Enable browser hardware acceleration or try a recent browser.',
    '此视图需要 WebGL2。请开启浏览器的硬件加速，或用较新版本的浏览器打开。'
  ),
  needsSixFields: choose(
    'This viewer needs a six-field export including saved Ohmic and viscous heating. Re-export the snapshot.',
    '这组数据未包含所需的六个物理量。请使用同时包含欧姆加热率和黏性加热率的模拟快照。'
  ),
  textureBudget: choose(
    'This product exceeds the six-layer desktop texture budget (768 MiB).',
    '六个图层占用的纹理内存超过了 768 MiB 的上限。'
  ),
  gpuTooSmall: choose('This GPU cannot hold the web volume.', '此设备无法显示这么大的三维网格。'),
  graphicsLost: choose(
    'Graphics context lost. Reload this page to restore the volume.',
    '图形渲染已中断，请刷新页面重新打开三维视图。'
  ),
  invalidUrl: choose('Unexpected volume asset URL', '三维数据文件的地址无效。'),
  invalidSample: choose('Invalid volume sample', '三维数据中含有无效值。'),
  bytesMismatch: file => choose(`Wrong byte count for ${file}`, `文件 ${file} 的大小与数据清单不符。`),
  checksumMismatch: file => choose(`Checksum mismatch for ${file}`, `文件 ${file} 未通过完整性校验。`),
  invalidManifest: (key, title) => choose(`Invalid texture manifest for ${key}`, `“${title}”图层的数据清单无效。`),
  gpuUpload: (title, code) => choose(
    `GPU could not upload ${title} (WebGL error ${code}).`,
    `“${title}”图层无法载入显存（WebGL 错误码 ${code}）。`
  ),
  loadFailed: (title, reason) => choose(`Could not load ${title}. ${reason}`, `无法加载“${title}”图层。${reason}`),
  genericError: reason => choose(reason, '打开数据或绘图时出错，请重试。'),
  transfer: size => choose(
    `Each field loads separately (${size} MiB). Pause rotation for the fine view.`,
    `每个图层单独加载（${size} MiB）。暂停旋转即可查看细节。`
  ),
  opacity: choose('Opacity', '不透明度'),
  opacityLabel: title => choose(`${title} opacity`, `${title}图层的不透明度`),
  loading: title => choose(`Loading ${title}…`, `正在加载${title}…`),
  preparing: title => choose(`Preparing ${title}…`, `正在准备${title}图层…`),
  amount: (current, total, percent) => choose(
    `${current} of ${total} MiB · ${percent}%`, `${current} / ${total} MiB · ${percent}%`
  ),
  grid: (shape, n, factor) => choose(
    `Source grid: ${shape}. Interactive display: ${n}³ volume cells; each is the linear volume-weighted mean of ${factor} source cells. This is one fixed snapshot, not a time sequence.`,
    `原始网格为 ${shape}，显示网格为 ${n}³。每个显示网格单元的值都是将 ${factor} 个原始单元中的物理量按体积加权平均后得到的，取平均前不取对数。图中展示的是模拟中同一时刻的状态。`
  ),
  sampling: (error, compact) => {
    const englishData = compact
      ? 'Only selected display fields are downloaded. The display bytes are not quantitative source data.'
      : 'The downloaded model retains Float32 logs.';
    const chineseData = compact
      ? '仅下载已选中的图层。这些显示数据不宜用于定量分析。'
      : '下载的数据保留了 32 位浮点格式的对数值。';
    return choose(
      `The GPU display uses 8-bit logarithmic sampling (maximum half-step error: ${error} dex inside the color limits), with trilinear interpolation. Values beyond each legend saturate. ${englishData}`,
      `渲染采用 8 位对数采样和三线性插值。在色标范围内，量化误差不超过半个采样间隔（${error} dex）。超出色标范围的值以端点颜色显示。${chineseData}`
    );
  },
  blended: choose('Illustrative blend · multiple scalar fields', '多个图层叠加显示'),
  single: choose('Single field · fixed logarithmic scale', '单个图层，固定对数色标'),
  empty: choose('Select a field to reveal the volume.', '勾选一个图层，查看对应物理量的三维分布。'),
  fullBox: choose('Full box', '显示整个模拟区域'),
  cut: pos => choose(`Cutaway · x1 ≤ ${pos} kpc`, `显示 x₁ ≤ ${pos} kpc 的区域`),
  rotate: choose('▶ Rotate', '▶ 自动旋转'),
  pause: choose('Ⅱ Pause', 'Ⅱ 暂停旋转'),
  status: (n, moving, cut) => {
    const items = [choose(`${n}³ display`, `${n}³ 显示网格`)];
    if (moving) items.push(choose('orbit preview', '旋转预览'));
    if (cut) items.push(choose('spatial cutaway', '剖切视图'));
    items.push(choose('opacity is illustrative', '不透明度仅用于显示'));
    return items.join(' · ');
  },
  ready: names => choose(names.join(', ') + ' ready to explore.', names.join('、') + '图层已就绪。'),
};
