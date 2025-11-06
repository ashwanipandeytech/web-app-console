export interface Commonresponseobject {
  sessionId: any;
  totalRows: any;
  success: string;
  auth: string;
  application: string;
  data: any;
  message: any;
  error: string;
  LatestAppVersion: string;
  oemProductCode: string;
  productCode: string;
  isUsed: string;
  status: string;
  otp: string;
  lastfile: string;
  gridProductCode: any;
  productList: any;
  storedStatus: any;
  currentStatus: any;
  data1: any;
  data2: any;
  data3: any;
  dataTransfer: any;
  availableOem: any;
  availableProducts: any;
  activePageCount: any;
  inactivePageCount: any;
  oemBasedProduct: any;
  oemBasedDesigner: any;
  type: any;
  numberOfPages: any;
  fileName: any;
  total: any;
  downloadFileName: any;
  isExist: any;
  invoicePdfUrl: any;
  proFilter: any;
  catFilter: any;
  downloadFile: any;
  isDuplicate: boolean;
  placeholders: any;
  promoexist: any;
  orderStatus: any;
  isCancelDisable: any;
}



export interface TreeNode {
  name: string;
  subcategories?: TreeNode[];
}
export interface DropInfo {
  targetId: string;
  targetparentId: string;
  action?: string;
}
