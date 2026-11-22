/* Strategy page: one purchase at the top of the dot-com boom, and the same
   purchase followed by a fixed amount every month.

   Two charts of TQQQ from the close of 27 March 2000, the Nasdaq-100's high,
   to the close of 31 December 2025. The first is $10,000 put in that day and
   nothing after. The second is the same $10,000, then $800 at the first close
   of every month from April 2000. Each is drawn against the money put in, on
   a log scale that runs the same number of steps of ten on both, so the same
   height is the same change on both.

   THE NUMBERS ARE HELD IN THIS FILE, as one series: what the first $10,000
   was worth at each close kept here (every month's first and last close, and
   the days the page names). Both holdings are worked out from it below, so
   the charts, the table on the page and the words around them move together.

   TQQQ began on 11 February 2010. From that day the series is the fund's own
   adjusted closes from Yahoo Finance. Before it, the fund is rebuilt from
   QQQ's adjusted closes: three times each day's move, less 0.95% a year for
   the fee and twice the federal funds rate plus 0.471% a year for what the
   swaps cost. The 0.471% is set so that the same sum, run from 11 February
   2010 to the end of 2025, lands on the real fund's result. Its three worst
   falls since 2010 come out within half a point of the real ones.

   History does not go stale, but the right-hand end does. To add a month:
   multiply the last value by TQQQ's adjusted close on the new day over its
   adjusted close on the last day held, for the month's first close (add its
   day to BUY) and its last. Then change the figures on the page that these
   charts print: the captions, the table and the paragraphs around them.

   Teal, the colour of 3x everywhere on the site. The money put in is ink,
   dashed. The tint is the site's loss colour: the holding was worth less
   than the money put in.

   Pure SVG through js/chartkit.js, drawn at the width it is shown at. Moving
   a pointer or a finger across a chart reads out the close under it. */
(function () {
  "use strict";

  var CK = window.TTF_CHART;
  if (!CK) return;

  var DAY0 = Date.UTC(1999, 11, 31), MS = 86400000;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LOSS = "#A33220";
  var FIRST = 10000, MONTHLY = 800;
  var REAL_FROM = 3695;      // 11 Feb 2010, TQQQ's first close

  /* D: days after 31 Dec 1999.  P: what the first $10,000 was worth at that
     close, in dollars.  BUY: the days a monthly $800 went in. */
  var D = [
    87, 91, 94, 119, 122, 152, 153, 182, 185, 213, 214, 244, 245, 273, 276, 305,
    306, 335, 336, 364, 368, 397, 398, 425, 426, 454, 455, 458, 486, 487, 517, 518,
    546, 549, 578, 579, 609, 613, 637, 640, 670, 671, 700, 703, 731, 733, 762, 763,
    790, 791, 818, 822, 851, 852, 882, 885, 910, 913, 943, 944, 973, 977, 1004, 1005,
    1013, 1035, 1036, 1064, 1067, 1096, 1098, 1127, 1130, 1155, 1158, 1186, 1187, 1216, 1217, 1246,
    1249, 1277, 1278, 1308, 1309, 1337, 1341, 1369, 1370, 1400, 1403, 1428, 1431, 1461, 1463, 1491,
    1494, 1519, 1522, 1552, 1553, 1582, 1585, 1610, 1614, 1643, 1644, 1673, 1676, 1705, 1706, 1735,
    1736, 1764, 1767, 1796, 1797, 1827, 1830, 1858, 1859, 1886, 1887, 1917, 1918, 1946, 1949, 1978,
    1979, 2008, 2009, 2037, 2040, 2070, 2071, 2100, 2103, 2131, 2132, 2153, 2154, 2161, 2162, 2191,
    2195, 2223, 2224, 2251, 2252, 2282, 2285, 2310, 2313, 2343, 2344, 2373, 2376, 2404, 2405, 2435,
    2436, 2464, 2467, 2496, 2497, 2526, 2527, 2555, 2560, 2588, 2589, 2616, 2617, 2646, 2649, 2677,
    2678, 2708, 2709, 2737, 2740, 2769, 2770, 2800, 2804, 2828, 2831, 2861, 2862, 2891, 2894, 2922,
    2924, 2953, 2954, 2982, 2985, 3013, 3014, 3043, 3044, 3073, 3076, 3104, 3105, 3135, 3136, 3164,
    3168, 3196, 3197, 3227, 3230, 3247, 3255, 3258, 3288, 3290, 3318, 3321, 3346, 3349, 3356, 3378,
    3379, 3408, 3409, 3437, 3440, 3469, 3470, 3500, 3503, 3531, 3532, 3561, 3562, 3591, 3594, 3622,
    3623, 3653, 3657, 3682, 3685, 3695, 3710, 3713, 3743, 3744, 3773, 3776, 3801, 3805, 3834, 3835,
    3864, 3867, 3896, 3897, 3926, 3927, 3955, 3958, 3987, 3988, 4018, 4021, 4049, 4050, 4077, 4078,
    4108, 4109, 4137, 4140, 4169, 4170, 4199, 4200, 4228, 4231, 4261, 4262, 4291, 4294, 4322, 4323,
    4352, 4353, 4382, 4386, 4387, 4388, 4414, 4415, 4443, 4444, 4473, 4476, 4504, 4505, 4535, 4536,
    4564, 4567, 4596, 4597, 4627, 4631, 4655, 4658, 4688, 4689, 4718, 4721, 4749, 4751, 4780, 4781,
    4808, 4809, 4836, 4840, 4869, 4870, 4900, 4903, 4928, 4931, 4961, 4962, 4991, 4995, 5022, 5023,
    5053, 5054, 5082, 5085, 5114, 5116, 5145, 5148, 5173, 5176, 5204, 5205, 5234, 5235, 5264, 5267,
    5295, 5296, 5326, 5327, 5355, 5359, 5387, 5388, 5418, 5421, 5446, 5449, 5479, 5481, 5509, 5512,
    5537, 5540, 5569, 5570, 5599, 5600, 5628, 5631, 5660, 5661, 5691, 5694, 5722, 5723, 5752, 5753,
    5782, 5785, 5813, 5814, 5844, 5848, 5873, 5876, 5904, 5905, 5935, 5936, 5964, 5967, 5996, 5997,
    6026, 6027, 6055, 6058, 6088, 6089, 6118, 6121, 6149, 6150, 6179, 6180, 6209, 6213, 6241, 6242,
    6269, 6270, 6300, 6303, 6328, 6331, 6361, 6362, 6391, 6394, 6422, 6423, 6453, 6454, 6482, 6485,
    6514, 6515, 6544, 6545, 6573, 6577, 6606, 6607, 6634, 6635, 6663, 6667, 6695, 6696, 6726, 6727,
    6755, 6758, 6787, 6788, 6818, 6822, 6846, 6849, 6879, 6880, 6909, 6912, 6940, 6942, 6971, 6972,
    6999, 7000, 7028, 7031, 7060, 7061, 7091, 7094, 7119, 7122, 7152, 7153, 7182, 7186, 7213, 7214,
    7244, 7245, 7273, 7276, 7305, 7307, 7336, 7339, 7364, 7367, 7396, 7397, 7426, 7427, 7455, 7458,
    7487, 7488, 7518, 7521, 7549, 7550, 7579, 7580, 7609, 7612, 7640, 7641, 7671, 7675, 7700, 7703,
    7728, 7731, 7761, 7762, 7791, 7794, 7819, 7823, 7852, 7853, 7882, 7885, 7914, 7915, 7944, 7945,
    7973, 7976, 8005, 8006, 8036, 8039, 8067, 8068, 8095, 8096, 8126, 8127, 8155, 8158, 8187, 8188,
    8217, 8218, 8246, 8249, 8279, 8280, 8309, 8312, 8340, 8341, 8370, 8371, 8400, 8404, 8432, 8433,
    8460, 8461, 8491, 8494, 8519, 8522, 8552, 8553, 8582, 8585, 8613, 8614, 8644, 8645, 8673, 8676,
    8705, 8706, 8735, 8736, 8764, 8768, 8797, 8798, 8826, 8827, 8854, 8858, 8887, 8888, 8918, 8921,
    8946, 8949, 8979, 8980, 9009, 9013, 9040, 9041, 9071, 9072, 9100, 9103, 9132, 9134, 9163, 9166,
    9191, 9194, 9222, 9223, 9252, 9253, 9282, 9285, 9313, 9314, 9344, 9345, 9373, 9377, 9405, 9406,
    9436, 9439, 9464, 9467, 9497];
  var P = [
    10000, 7933.759, 6502.779, 4387.514, 4506.565, 2554.991, 2945.424, 3392.287, 3587.765, 2816.897,
    2703.081, 3998.551, 4114.308, 2483.617, 2314.29, 1730.271, 1684.61, 712.7147, 746.7861, 494.0214,
    368.4763, 569.4944, 591.8596, 212.6678, 230.7383, 102.9746, 104.5215, 90.46511, 146.0731, 164.0586,
    123.485, 134.37, 126.4629, 124.3392, 91.52579, 100.3015, 58.19754, 52.64626, 27.04342, 26.33316,
    39.68632, 44.72845, 60.76204, 57.61266, 54.86875, 59.9339, 51.57823, 50.0809, 33.62631, 39.4726,
    39.59399, 41.85863, 25.9773, 25.55435, 20.50375, 18.32899, 12.87773, 11.0248, 8.94467, 7.682674,
    8.029336, 7.156004, 5.33654, 6.308989, 4.756145, 8.358292, 9.071521, 11.5595, 11.90739, 7.62551,
    8.591142, 7.450703, 7.4952, 8.009704, 7.521321, 7.848756, 8.033967, 9.918673, 10.17719, 12.44191,
    12.17676, 12.44419, 12.94073, 14.60399, 14.13314, 16.67203, 17.38829, 14.94501, 15.9521, 18.79643,
    19.72299, 18.87573, 19.70493, 20.43979, 20.26785, 21.26227, 21.08633, 20.25163, 21.04539, 18.76799,
    19.2673, 16.84941, 17.3261, 19.41774, 19.33455, 21.15771, 19.9766, 16.47032, 16.56643, 15.06183,
    15.39115, 16.43984, 17.78422, 18.79101, 19.00148, 22.22953, 23.58924, 24.11329, 23.34422, 19.56191,
    19.74373, 19.06549, 19.68925, 17.87309, 17.32469, 15.40434, 15.58422, 19.68306, 20.15728, 17.59812,
    17.5205, 21.71707, 21.82511, 20.5189, 20.41734, 21.08256, 21.23585, 19.87482, 19.82225, 24.35469,
    24.52184, 23.51053, 24.81967, 22.05408, 23.51728, 24.34814, 24.5976, 22.48894, 23.39765, 23.57564,
    23.6489, 23.15357, 22.46222, 18.16045, 19.4431, 17.71624, 18.02323, 15.24172, 14.47048, 17.23321,
    17.50441, 19.46068, 18.71907, 22.02113, 21.11088, 24.02503, 23.39188, 22.41571, 22.5297, 23.51445,
    23.39125, 21.97373, 21.65908, 21.95714, 22.03753, 25.52789, 25.44911, 27.62869, 27.66803, 27.63821,
    28.37416, 27.08057, 27.70016, 28.7093, 30.12321, 32.99112, 34.11138, 39.62592, 37.38212, 31.04522,
    30.25002, 30.39514, 28.94615, 20.23705, 20.85125, 17.1729, 16.83314, 17.66451, 19.92711, 21.78916,
    23.8473, 25.53984, 24.59945, 18.42439, 19.20335, 18.3999, 17.69146, 18.90237, 18.19721, 10.6499,
    10.3108, 5.45389, 5.417836, 2.388804, 3.459966, 2.678547, 3.491901, 3.945984, 3.137551, 3.250643,
    2.59578, 2.343803, 2.099421, 3.323381, 3.471068, 4.705299, 4.741938, 5.092369, 5.528044, 5.490548,
    5.499112, 6.909954, 7.21939, 7.149507, 6.747027, 8.36928, 7.62571, 7.529739, 7.622834, 8.982554,
    9.260148, 10.3978, 10.85367, 8.407497, 8.683773, 8.887471, 9.555235, 9.9651, 11.9042, 11.88066,
    12.62975, 13.14555, 9.743566, 9.473912, 7.904028, 7.826978, 9.626943, 10.14488, 8.171545, 8.856447,
    11.69656, 11.66019, 13.98344, 14.01557, 13.78336, 14.65979, 15.82515, 16.54001, 17.09222, 18.04139,
    18.65458, 17.75781, 18.21583, 18.24365, 19.77823, 19.67123, 18.92642, 17.71716, 17.59943, 18.41489,
    18.37852, 18.13023, 14.78714, 14.3698, 12.67039, 11.67733, 16.66629, 15.37571, 14.97547, 15.29653,
    14.55171, 15.37999, 15.56405, 15.94716, 18.45984, 18.91355, 22.1775, 22.71685, 25.60619, 26.38737,
    24.50395, 24.64309, 19.49358, 17.96113, 21.40269, 21.57392, 21.89066, 21.67666, 25.41358, 25.30654,
    25.95721, 25.8459, 21.89926, 22.82813, 22.59698, 22.4857, 22.16036, 24.22784, 23.85545, 24.63878,
    23.9967, 24.24498, 26.09417, 25.58906, 27.90486, 27.54957, 30.89267, 31.07245, 28.41422, 29.02207,
    34.1373, 35.1775, 33.55946, 34.11162, 38.56341, 39.71915, 44.23081, 44.20942, 48.80244, 48.49852,
    53.1258, 51.88443, 49.74845, 46.45244, 57.4106, 56.15212, 52.60783, 55.45869, 51.53773, 52.00003,
    58.49788, 58.35233, 64.03045, 66.17962, 65.98272, 65.22062, 76.18921, 76.82285, 74.07427, 70.5294,
    78.94633, 79.75976, 90.23172, 86.90091, 83.45573, 82.77064, 77.65797, 79.69618, 95.31684, 97.88602,
    88.20901, 86.71871, 92.75691, 96.50828, 98.64947, 99.51454, 91.10391, 92.971, 103.2659, 102.3152,
    81.28862, 73.91434, 74.67658, 75.72149, 102.478, 105.9724, 103.8227, 106.906, 97.83586, 91.8576,
    77.16039, 77.59719, 72.50113, 79.43864, 87.70364, 90.62426, 79.31871, 81.4171, 89.50227, 89.53655,
    82.49627, 83.62683, 101.0734, 102.6578, 104.0967, 104.5592, 110.1349, 109.8866, 105.056, 102.8976,
    106.2122, 100.3796, 108.9701, 111.6081, 126.1425, 128.5407, 143.0324, 147.6574, 151.1004, 150.7749,
    163.2967, 167.4078, 181.9679, 184.1435, 167.2879, 162.7314, 188.3059, 189.5393, 197.7958, 197.6588,
    195.706, 196.2541, 222.5995, 222.3082, 234.8471, 231.7123, 237.6222, 249.8184, 303.4513, 295.8628,
    284.7457, 271.042, 246.5295, 224.6379, 245.4846, 253.467, 287.2124, 300.5735, 293.4819, 300.0596,
    315.6818, 319.9985, 371.5415, 367.1222, 365.5804, 367.6874, 268.3013, 280.0179, 260.4902, 273.8513,
    190.6015, 193.3288, 241.9054, 238.8179, 262.6431, 267.8919, 291.6661, 303.1454, 340.2085, 336.2963,
    258.5152, 241.9912, 317.9706, 330.6339, 337.6862, 332.9503, 311.3816, 302.3218, 317.25, 309.58,
    356.681, 366.3586, 400.1788, 387.3096, 445.6906, 467.7821, 482.2007, 504.3437, 396.5127, 450.6342,
    245.323, 214.8893, 359.2818, 327.0458, 426.2254, 431.4779, 502.8503, 520.8221, 614.7493, 637.6646,
    830.926, 874.079, 674.0718, 705.6383, 604.8107, 605.0167, 813.7267, 845.705, 936.1821, 895.2434,
    931.7536, 1000.242, 918.8796, 999.0063, 939.8898, 987.6772, 1108.794, 1090.668, 1056.578, 1046.278,
    1261.632, 1262.25, 1367.094, 1366.682, 1539.603, 1548.048, 1282.951, 1306.329, 1597.998, 1613.756,
    1683.789, 1597.38, 1713.038, 1762.473, 1273.578, 1297.884, 1080.574, 1030.727, 1198.395, 1193.246,
    752.4473, 787.8761, 680.7661, 664.9057, 494.3536, 502.3868, 687.1514, 686.1216, 572.8322, 573.4501,
    397.9546, 425.5561, 431.5295, 418.1408, 485.2904, 487.9682, 358.1961, 350.1211, 474.3509, 504.9943,
    458.201, 447.0204, 588.5336, 584.3685, 588.3253, 586.6593, 723.6924, 749.9326, 856.5533, 862.4029,
    946.5958, 939.2837, 886.637, 883.5031, 746.7781, 764.5984, 687.237, 722.6681, 919.7402, 927.4974,
    1067.598, 1013.482, 1108.449, 1147.616, 1271.011, 1329.339, 1300.957, 1308.987, 1114.562, 1090.47,
    1321.456, 1334.347, 1566.015, 1591.684, 1448.49, 1344.117, 1455.491, 1322.691, 1542.753, 1477.417,
    1478.055, 1509.553, 1700.242, 1755.363, 1689.664, 1678.987, 1766.321, 1723.615, 1599.768, 1496.419,
    1227.137, 1255.407, 1175.311, 1215.787, 1499.121, 1533.6, 1782.504, 1737.19, 1894.394, 1780.786,
    1919.091, 1870.126, 2222.737, 2254.122, 2509.07, 2543.464, 2344.837, 2323.77, 2270.139];
  var BUY = [
    94, 122, 153, 185, 214, 245, 276, 306, 336, 368, 398, 426, 458, 487, 518, 549,
    579, 613, 640, 671, 703, 733, 763, 791, 822, 852, 885, 913, 944, 977, 1005, 1036,
    1067, 1098, 1130, 1158, 1187, 1217, 1249, 1278, 1309, 1341, 1370, 1403, 1431, 1463, 1494, 1522,
    1553, 1585, 1614, 1644, 1676, 1706, 1736, 1767, 1797, 1830, 1859, 1887, 1918, 1949, 1979, 2009,
    2040, 2071, 2103, 2132, 2162, 2195, 2224, 2252, 2285, 2313, 2344, 2376, 2405, 2436, 2467, 2497,
    2527, 2560, 2589, 2617, 2649, 2678, 2709, 2740, 2770, 2804, 2831, 2862, 2894, 2924, 2954, 2985,
    3014, 3044, 3076, 3105, 3136, 3168, 3197, 3230, 3258, 3290, 3321, 3349, 3379, 3409, 3440, 3470,
    3503, 3532, 3562, 3594, 3623, 3657, 3685, 3713, 3744, 3776, 3805, 3835, 3867, 3897, 3927, 3958,
    3988, 4021, 4050, 4078, 4109, 4140, 4170, 4200, 4231, 4262, 4294, 4323, 4353, 4386, 4415, 4444,
    4476, 4505, 4536, 4567, 4597, 4631, 4658, 4689, 4721, 4751, 4781, 4809, 4840, 4870, 4903, 4931,
    4962, 4995, 5023, 5054, 5085, 5116, 5148, 5176, 5205, 5235, 5267, 5296, 5327, 5359, 5388, 5421,
    5449, 5481, 5512, 5540, 5570, 5600, 5631, 5661, 5694, 5723, 5753, 5785, 5814, 5848, 5876, 5905,
    5936, 5967, 5997, 6027, 6058, 6089, 6121, 6150, 6180, 6213, 6242, 6270, 6303, 6331, 6362, 6394,
    6423, 6454, 6485, 6515, 6545, 6577, 6607, 6635, 6667, 6696, 6727, 6758, 6788, 6822, 6849, 6880,
    6912, 6942, 6972, 7000, 7031, 7061, 7094, 7122, 7153, 7186, 7214, 7245, 7276, 7307, 7339, 7367,
    7397, 7427, 7458, 7488, 7521, 7550, 7580, 7612, 7641, 7675, 7703, 7731, 7762, 7794, 7823, 7853,
    7885, 7915, 7945, 7976, 8006, 8039, 8068, 8096, 8127, 8158, 8188, 8218, 8249, 8280, 8312, 8341,
    8371, 8404, 8433, 8461, 8494, 8522, 8553, 8585, 8614, 8645, 8676, 8706, 8736, 8768, 8798, 8827,
    8858, 8888, 8921, 8949, 8980, 9013, 9041, 9072, 9103, 9134, 9166, 9194, 9223, 9253, 9285, 9314,
    9345, 9377, 9406, 9439, 9467];

  var isBuy = {};
  BUY.forEach(function (d) { isBuy[d] = true; });

  /* A holding, close by close: what it was worth and what had been put in. */
  function hold(monthly) {
    var shares = FIRST / P[0], put = FIRST, v = [], m = [];
    for (var i = 0; i < D.length; i++) {
      if (monthly && isBuy[D[i]]) { shares += monthly / P[i]; put += monthly; }
      v.push(shares * P[i]); m.push(put);
    }
    return { v: v, m: m };
  }

  var CHARTS = {
    once: {
      name: "Bought once", h: hold(0), lo: 0.4, hi: 100000,
      grid: [1, 10, 100, 1000, 10000, 100000],
      marks: [["Oct 2002", 1013, "value"], ["Mar 2009", 3356, "value"]]
    },
    monthly: {
      name: "Bought every month", h: hold(MONTHLY), lo: 400, hi: 100000000,
      grid: [1000, 10000, 100000, 1000000, 10000000, 100000000],
      marks: [["Mar 2001", 454, "under"], ["Nov 2008", 3247, "under"]]
    }
  };

  function commas(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function usd(v) { return "$" + (v < 100 ? v.toFixed(2) : commas(v)); }
  function short(v) {
    if (v >= 1000000) return "$" + (v / 1000000).toFixed(v >= 10000000 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
    return "$" + Math.round(v);
  }
  function endShort(v) {
    if (v >= 1000000) return "$" + (v / 1000000).toFixed(1) + "M";
    if (v >= 100000) return "$" + Math.round(v / 1000) + "k";
    return usd(v);
  }
  function monthOf(d) { var t = new Date(DAY0 + d * MS); return MONTHS[t.getUTCMonth()] + " " + t.getUTCFullYear(); }
  function dayOfYear(y) { return (Date.UTC(y, 0, 1) - DAY0) / MS; }
  function under(v, m) { return (1 - v / m) * 100; }
  function pct(x) { return (x >= 99.5 ? x.toFixed(2) : x.toFixed(x >= 10 ? 0 : 1)) + "%"; }

  /* What each chart says before a pointer is on it, and what the page prints
     if this file never runs. Keep the two the same. */
  function resting(C) {
    var n = D.length - 1;
    return C.h.m[n] === FIRST
      ? usd(FIRST) + " on 27 March 2000 was " + usd(C.h.v[n]) + " at the end of 2025"
      : usd(C.h.m[n]) + " put in by the end of 2025 was worth " + usd(C.h.v[n]);
  }

  function paint(host, read, C) {
    var n = D.length, x0 = D[0], x1 = D[n - 1], V = C.h.v, M = C.h.m;

    CK.fit(host, 560, function (W) {
      var H = Math.round(Math.max(260, Math.min(340, W * 0.66)));
      var L = 46, R = 58, T = 14, B = 30;
      var el = CK.el;
      var xf = function (d) { return L + (W - L - R) * (d - x0) / (x1 - x0); };
      var lg = function (v) { return Math.log(v) / Math.LN10; };
      var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(C.lo)) / (lg(C.hi) - lg(C.lo))); };

      var s = CK.svg(host, W, H, C.name + ": TQQQ from the close of 27 March 2000 to the end of 2025, log scale. " +
        usd(M[n - 1]) + " put in, worth " + usd(V[n - 1]) + " at the end. " +
        C.marks.map(function (k) { var i = D.indexOf(k[1]); return k[0] + ": " + usd(V[i]) + " on " + usd(M[i]) + " put in"; }).join(". ") + ".");

      // the grid
      C.grid.forEach(function (v) {
        var gy = yf(v);
        s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: CK.K.ink, "stroke-opacity": ".09" }));
        CK.text(s, L - 8, gy + 4, short(v), { "text-anchor": "end" });
      });

      CK.thin([2000, 2005, 2010, 2015, 2020, 2025].map(function (y) {
        var d = Math.max(x0, dayOfYear(y)), frac = (d - x0) / (x1 - x0);
        return CK.text(s, xf(d), H - 10, y, { "text-anchor": frac < 0.03 ? "start" : (frac > 0.97 ? "end" : "middle") });
      }), 8);

      var vp = D.map(function (d, k) { return [xf(d), yf(V[k])]; });
      var mp = D.map(function (d, k) { return [xf(d), yf(M[k])]; });
      var d2 = function (pts) { return pts.map(function (p, k) { return (k ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };

      // worth less than the money put in: the tint between the two lines
      var low = D.map(function (d, k) { return [xf(d), yf(Math.min(V[k], M[k]))]; });
      s.appendChild(el("path", { d: d2(low) + " " + mp.slice().reverse().map(function (p) { return "L" + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + " Z",
        fill: LOSS, "fill-opacity": ".09", stroke: "none" }));

      // where the rebuilt fund ends and the real one begins
      var rx = xf(REAL_FROM);
      s.appendChild(el("line", { x1: rx.toFixed(1), y1: T, x2: rx.toFixed(1), y2: H - B, stroke: CK.K.ink, "stroke-opacity": ".35", "stroke-dasharray": "2 4" }));
      var ra = CK.text(s, rx - 6, T + 9, "rebuilt", { "text-anchor": "end", "font-size": "10.5" });
      var rb = CK.text(s, rx + 6, T + 9, "real fund", { "text-anchor": "start", "font-size": "10.5" });

      // the money put in, and the holding
      s.appendChild(el("path", { d: d2(mp), fill: "none", stroke: CK.K.ink, "stroke-width": "1.5", "stroke-dasharray": "5 4", "stroke-opacity": ".8" }));
      s.appendChild(el("path", { d: d2(vp), fill: "none", stroke: CK.K.cyan, "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round" }));

      // where it starts and where each line ends
      s.appendChild(el("circle", { cx: vp[0][0], cy: vp[0][1], r: "3.5", fill: CK.K.ink, stroke: CK.K.card, "stroke-width": "1.5" }));
      var last = vp[n - 1], lastM = mp[n - 1];
      s.appendChild(el("circle", { cx: last[0], cy: last[1], r: "4", fill: CK.K.cyan, stroke: CK.K.card, "stroke-width": "2" }));
      var ends = [{ y: last[1], h: 15, str: endShort(V[n - 1]), fill: CK.txt(CK.K.cyan), w: "600" },
                  { y: lastM[1], h: 15, str: endShort(M[n - 1]) + " in", fill: CK.K.ink, w: "400" }];
      CK.spread(ends, T + 8, H - B - 6, 2);
      var placed = [];
      ends.forEach(function (e) {
        var t = CK.text(s, W - R + 8, e.y + 4, e.str, { "font-size": "12", "font-weight": e.w, fill: e.fill });
        var b = CK.box(t); if (b) placed.push(b);
      });
      [ra, rb].forEach(function (t) { var b = CK.box(t); if (b) placed.push(b); });

      // the days the page names, each marked and labelled where nothing else is
      C.marks.forEach(function (k) {
        var i = D.indexOf(k[1]); if (i < 0) return;
        var px = vp[i][0], py = vp[i][1];
        s.appendChild(el("circle", { cx: px.toFixed(1), cy: py.toFixed(1), r: "4", fill: LOSS, stroke: CK.K.card, "stroke-width": "2" }));
        var a = CK.text(s, px, py, k[0], { "font-size": "11" });
        var b = CK.text(s, px, py, k[2] === "value" ? usd(V[i]) : pct(under(V[i], M[i])) + " under", { "font-size": "12", "font-weight": "600", fill: LOSS });
        var tries = [["start", 9, -4], ["end", -9, -4], ["start", 9, 14], ["end", -9, 14], ["middle", 0, 19], ["start", 7, 19], ["end", -7, 19],
                     ["start", 12, -18], ["end", -12, -18], ["middle", 0, -32], ["start", 14, 6], ["end", -14, 6]];
        var best = null;
        for (var q = 0; q < tries.length; q++) {
          var t = tries[q];
          [a, b].forEach(function (node, j) {
            node.setAttribute("text-anchor", t[0]);
            node.setAttribute("x", (px + t[1]).toFixed(1));
            node.setAttribute("y", (py + t[2] + j * 14).toFixed(1));
          });
          var bx = CK.bounds([a, b]);
          if (!bx) break;
          var bad = (bx.x < L + 2 || bx.x + bx.width > W - R - 2 || bx.y < T + 1 || bx.y + bx.height > H - B - 1 ? 5 : 0) +
                    (placed.some(function (o) { return CK.overlap(bx, o); }) ? 4 : 0) +
                    (CK.crosses(bx, [vp, mp]) ? 3 : 0);
          if (best === null || bad < best.bad) best = { q: q, bad: bad };
          if (!bad) break;
        }
        if (best) {
          var u = tries[best.q];
          [a, b].forEach(function (node, j) {
            node.setAttribute("text-anchor", u[0]);
            node.setAttribute("x", (px + u[1]).toFixed(1));
            node.setAttribute("y", (py + u[2] + j * 14).toFixed(1));
          });
          CK.keepIn([a, b], L + 2, W - R - 2);
        }
        CK.plate(s, [a, b], 2);
        var fin = CK.bounds([a, b]);
        if (fin) placed.push(fin);
      });

      // the close under a pointer or a finger
      var hair = el("line", { x1: 0, y1: T, x2: 0, y2: H - B, stroke: CK.K.ink, "stroke-opacity": ".45", "stroke-width": "1", visibility: "hidden" });
      var dot = el("circle", { r: "4.5", fill: CK.K.cyan, stroke: CK.K.card, "stroke-width": "2", visibility: "hidden" });
      s.appendChild(hair); s.appendChild(dot);
      var pad = el("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "#fff", "fill-opacity": "0" });
      s.appendChild(pad);

      function show(clientX) {
        var box = s.getBoundingClientRect();
        if (!box.width) return;
        var px = (clientX - box.left) * W / box.width;
        var day = x0 + (x1 - x0) * Math.max(0, Math.min(1, (px - L) / (W - L - R)));
        var lo = 0, hi = n - 1;
        while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (D[mid] <= day) lo = mid; else hi = mid; }
        var k = day - D[lo] <= D[hi] - day ? lo : hi;
        hair.setAttribute("x1", vp[k][0].toFixed(1)); hair.setAttribute("x2", vp[k][0].toFixed(1)); hair.setAttribute("visibility", "visible");
        dot.setAttribute("cx", vp[k][0].toFixed(1)); dot.setAttribute("cy", vp[k][1].toFixed(1)); dot.setAttribute("visibility", "visible");
        if (read) {
          var r = V[k] / M[k];
          read.textContent = monthOf(D[k]) + ": " + usd(V[k]) + " on " + usd(M[k]) + " put in, " +
            (r < 0.9995 ? pct(under(V[k], M[k])) + " under" : (r < 2 ? Math.round((r - 1) * 100) + "% ahead" : (r < 10 ? r.toFixed(1) : Math.round(r)) + " times over"));
        }
      }
      function hide() {
        hair.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden");
        if (read) read.textContent = resting(C);
      }
      pad.addEventListener("pointermove", function (e) { show(e.clientX); });
      pad.addEventListener("pointerdown", function (e) { show(e.clientX); });
      pad.addEventListener("pointerleave", hide);
      pad.addEventListener("pointercancel", hide);
    });

    if (read) read.textContent = resting(C);
  }

  function start() {
    [["once", "dca-once"], ["monthly", "dca-monthly"]].forEach(function (p) {
      var host = document.getElementById(p[1]);
      if (host) paint(host, document.getElementById(p[1] + "-read"), CHARTS[p[0]]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
