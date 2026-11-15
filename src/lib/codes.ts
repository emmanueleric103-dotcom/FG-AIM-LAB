// ============================================
// FG AIM LAB - ONE-TIME HARD CODES
// ============================================
// 120 UNIQUE codes. Each code works ONLY ONCE.
// Format: FG-XXXX-XXXX-XXXX (12 random chars, no 0/O/1/I)
// Guessing chance: 1 in 32^12 = impossible to brute force.
// 
// HOW OWNER USES THEM:
// 1. After a buyer pays on Selar, pick the NEXT unused code from this list
//    (e.g. first one you haven't given out yet)
// 2. Send that ONE code to that ONE buyer via Selar delivery / WhatsApp / Email
// 3. Tick it off in your own sheet so you never send same code twice
// 4. When buyer enters it, site marks it USED globally (Netlify Function) + locally.
//    If another person tries same code, site says "This code has already been used."
//
// DO NOT share this whole list. Keep it private. Only give 1 code per buyer.
// To add more codes, generate new ones in same format and add to list.
// ============================================
export const VALID_CODES = new Set<string>([
  "FG-24ZB-GXNK-YXU2",
  "FG-2AQ7-9XNK-PYF6",
  "FG-2E4G-E8RR-UDGW",
  "FG-2PBR-BYR4-U85A",
  "FG-334F-4C8H-3DVP",
  "FG-3B76-C84C-5WW2",
  "FG-3RG5-THNH-5F4Q",
  "FG-4GZT-R7VF-BE36",
  "FG-4J5W-A23J-N4DN",
  "FG-5KF9-RWKX-C4UE",
  "FG-5NEZ-EGX3-V2HS",
  "FG-63BW-76NX-8TFN",
  "FG-66NZ-AFAD-8QXR",
  "FG-6JSF-M2UN-CYSQ",
  "FG-6S6Q-8G2E-TYAD",
  "FG-6UHC-2HFT-DS4F",
  "FG-7894-8ZVP-WD5B",
  "FG-7UQR-ZH3X-36M9",
  "FG-7YT6-NPM6-4XF9",
  "FG-824Y-J558-3ZC7",
  "FG-887S-FSE8-SFWW",
  "FG-8B2K-KYQX-8488",
  "FG-8JKG-XRUZ-XXKY",
  "FG-8PV2-T7DW-H6Y8",
  "FG-8YD9-T98S-2HGD",
  "FG-8YDZ-EHVY-JFBT",
  "FG-94WH-QJ3A-SM3D",
  "FG-954X-D2BV-8CF7",
  "FG-9GCP-QP49-GMV6",
  "FG-AQWS-V4WZ-YGCV",
  "FG-AZNW-YDBQ-NHGB",
  "FG-B7BM-R34Y-586Y",
  "FG-BGSN-DXC6-DVMT",
  "FG-BHTY-FECU-8SF6",
  "FG-BU6B-VZ6T-U9JM",
  "FG-C22F-85QZ-NHY2",
  "FG-CEEZ-W468-DDU8",
  "FG-CU7Y-CNRG-EFWD",
  "FG-CURT-478M-WBQJ",
  "FG-CYDH-T95S-XCVV",
  "FG-D7CD-7PX6-S5ZP",
  "FG-DA5Y-KFSC-63F7",
  "FG-DK8W-J4WN-XAAJ",
  "FG-DKC7-KDRS-SNHG",
  "FG-DRXN-V5K8-A684",
  "FG-DRYD-MAPR-JW5Q",
  "FG-EK7Y-K5X8-EVXZ",
  "FG-EMEX-4UUF-MTND",
  "FG-EN5R-KKDB-HUT2",
  "FG-F4YF-T29E-K7XZ",
  "FG-FN7B-3B5X-SHTU",
  "FG-FSXK-2GYM-SPKQ",
  "FG-G64B-9FPN-YYW9",
  "FG-GEVT-NG38-7JJS",
  "FG-GX3X-JYBV-PKKF",
  "FG-H6QA-3X35-M8ZJ",
  "FG-HFNB-H7G2-WM7B",
  "FG-HFQF-DQEK-ZF7R",
  "FG-HJNQ-HCMP-BE26",
  "FG-HNQU-UHP4-9FUD",
  "FG-HRMA-SXN2-8UDR",
  "FG-HTEE-SVZ7-FNM8",
  "FG-HTFS-6724-55XT",
  "FG-HXWZ-5PAH-DBWQ",
  "FG-J84U-RWVZ-NMYQ",
  "FG-JHAB-P7YA-929C",
  "FG-KASZ-3ZY5-WFNF",
  "FG-KCSG-SY8B-URQ8",
  "FG-KGDD-TJ3P-PEN3",
  "FG-MB23-3BVX-ZMWH",
  "FG-MC2G-53DB-QXDR",
  "FG-MFFR-HF5T-N6MF",
  "FG-MVAZ-UKBA-27NK",
  "FG-N5GA-E9TW-RAD4",
  "FG-NMG2-ABBZ-42N8",
  "FG-NSGU-ZMDE-4HRQ",
  "FG-NV6H-M4BS-BZEW",
  "FG-NWED-D99B-URGY",
  "FG-NXCR-GFEU-H5RR",
  "FG-PPK8-WG8X-FRVN",
  "FG-PRVJ-S8BB-F73F",
  "FG-PWSA-MHD2-6ATD",
  "FG-Q7AQ-9DJ7-G3PA",
  "FG-QGT5-9UJH-CGCU",
  "FG-QRFE-GGU6-44J3",
  "FG-RE2Q-72KG-S4EN",
  "FG-RJYG-BHHJ-YYCJ",
  "FG-RN9X-FUBW-QAN8",
  "FG-S2VE-8U5F-WMRV",
  "FG-SNXH-UXWN-YSA2",
  "FG-SRNA-XWAJ-GT45",
  "FG-T2NE-EN9U-B68S",
  "FG-T53Z-ZMM6-83EN",
  "FG-T59R-NW6K-UVDY",
  "FG-TGAK-YCWP-6BCH",
  "FG-TKHT-F8CP-2NBC",
  "FG-TSK9-3MJV-FPU4",
  "FG-TTCB-JMV6-CY47",
  "FG-U4XR-8CRM-ZC4Z",
  "FG-UH2A-BU6S-CUEX",
  "FG-UK33-M7WN-P984",
  "FG-UZ2Y-RESB-2PSY",
  "FG-V88X-4Z8V-EVQY",
  "FG-V8PY-KV7V-VBCD",
  "FG-VSGD-QW2M-NGVM",
  "FG-VSYA-88X6-5KGP",
  "FG-VZEG-YJ93-57RE",
  "FG-W2VS-RDHY-4P2H",
  "FG-WAJE-QR4N-Q8DF",
  "FG-WH6W-SB7F-88HK",
  "FG-WN3Z-RUPP-7NNP",
  "FG-X7X7-XFS4-7XYW",
  "FG-X9R9-N2U6-DH7D",
  "FG-XBXK-MSMZ-EDG6",
  "FG-YBT9-E6YC-S3TB",
  "FG-Z465-8UPR-DCFT",
  "FG-ZKBM-9QVT-E5X2",
  "FG-ZN75-KF5F-C7NF",
  "FG-ZY6D-UCUG-86WH",
  "FG-ZZ34-RXG8-92D7"
])

export function isCodeFormatValid(code: string): boolean {
  return /^FG-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code.trim().toUpperCase())
}

export function isCodeInList(code: string): boolean {
  return VALID_CODES.has(code.trim().toUpperCase())
}
