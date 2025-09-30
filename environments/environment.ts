// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.



export const environment = {

  environmentType:'stageat',
  

  
  at: {
    environmentTypeUrl: "https://api.sw.fit",
    googleTagManagerUrl: "https://www.googletagmanager.com",
    envContentColor: "#fafafa",
    ALLOW_SMART_BANNER:true,
    // CONTENTFULCONFIG: {
    //   space: 'hpzfbna3olmf',
    //   accessToken: 'kyRZX_XUiZNxcc0KtM08jvpnXrIJ-LjpKlNyw47nldY',
    //   environment: 'master',
    // },
    CONTENTFULCONFIG: {
      space: 'hpzfbna3olmf',
      accessToken: 'rbe0Cjmi-NLoiHwSZcRR9CeHeAiffdm82WstatYk-p0',
      environment: 'FS-AT',
    },
    oemCode: 'FS-AT',
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
