# KMK Campus Map Audit

基于用户提供的 KMK 卫星标注图与官方交通停车图，对当前 GIS 模型进行核对。

## 当前已实现的主要对象

### 入口 / 外部道路
- Pondok Pengawal
- Bulatan Masuk / Keluar
- Persiaran Kayu Manis（含北/南外部延伸）
- Jalan Pelaga（含西北/东部外部延伸）
- Jalan Bunga Lawang（含通往东侧住宅区外部延伸）
- Jalan Keluar Selatan
- 10 处斑马线 / pedestrian crossing

### 体育区
- Padang
- Athletics Track
- Astaka
- Gelanggang Tenis
- Gelanggang Tenis Timur
- Gelanggang Bola Keranjang
- Gelanggang Bola Tampar / Sepak Takraw
- Gelanggang Futsal / Badminton Outdoor

### 行政 / 礼堂 / HEP
- Bangunan Seri Jerai / Pentadbiran
- Pejabat HEP & Kaunseling
- Cafe Admin
- Dewan Baiduri
- Dewan Mahawangsa
- Garaj Bas

### 学术区
- Dewan Kuliah
- Makmal & Bilik Tutorial
- Bangunan Langkasuka
- Bangunan Langkasuka BL / Bilik Latihan

### 宗教 / 学生服务
- Masjid KMK（dome + minaret）
- Dataran Pelajar
- Dataran Kawad
- Pustaka
- Koperasi & Kedai Buku / Koop Mait
- Pejabat Pos & Mini Market
- ATM
- Daddy Corner
- Gerai Jualan / Serumpun

### 餐饮
- Kafe A
- Kafe B
- Kafe C
- Cafe Admin
- Daddy Corner
- Gerai Jualan / Serumpun

### 宿舍
- Blok A1
- Blok A2
- Blok B1
- Blok B2
- Blok C1
- Blok C2
- Blok P1
- Blok P2
- Blok P3
- Blok P4
- Blok P5

### 停车区
- Parkir Staf Admin
- Parkir A1 & A2
- Parkir B1 & B2
- Parkir C2 & B2
- Parkir Dewan Mahawangsa
- Parkir Staf & Pensyarah
- Parkir P5

### 东侧 / 住宅 / 绿化
- Rumah Ketua Jabatan
- Rumah Pengarah
- Rumah Semaian Pokok / Nurseri
- Taman Permainan

## 本轮补齐内容

本轮根据用户指出的“正确布局图”补齐：

1. 外部延伸道路：
   - Jalan Pelaga 向西北与东侧延伸
   - Persiaran Kayu Manis 向北与向南延伸
   - Jalan Bunga Lawang 向东侧住宅区延伸
   - 南侧出口 Jalan Keluar Selatan

2. 斑马线：
   - 入口
   - Guard house
   - Astaka / Padang
   - Dewan Mahawangsa
   - Kafe C
   - Masjid
   - Kafe A
   - Kafe B
   - South exit
   - Jalan Bunga Lawang

3. 缺漏设施：
   - Dewan Baiduri 独立体
   - Pejabat HEP & Kaunseling 独立体
   - Gelanggang Bola Tampar / Sepak Takraw
   - Gelanggang Futsal / Badminton Outdoor
   - Blok P5
   - Parkir P5
   - 主要 Parkir 区作为可搜索 GIS 对象

## 仍需原始 DXF / 高清矢量确认

以下项目从截图可见但仍无法仅凭当前图片 100% 确认精确 footprint：

- 部分小型棚屋 / service sheds
- 每栋宿舍内部房间走廊的真实宽度
- 每条 selasar 的准确柱位
- 东侧住宅区道路旁的小型建筑边界
- 标注文字被手写覆盖的若干停车细分区
- 道路箭头方向、车道线、停车格数量

结论：当前版本已经补齐可从图片清楚识别的主要建筑、道路、斑马线与停车区。下一步若要达到 CAD/DXF 级 1:1，需要导入原始 DXF / SVG / geo-referenced raster 进行自动矢量提取。