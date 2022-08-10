import { randomBytes } from 'crypto';
export type OrderBy = 'name' | 'name desc' | 'random';
export type SizeType = 'GB' | 'MB' | 'KB';
export interface Config {
   /**
  * the path of folder that have many files to be divided.
  */
   path: string
   /**
    * number of files limit in each subfolder. 0 == unlimited. First limit reached will apply.
    */
   subFiles: number
   /**
   * limit size of each subfolder. In Bytes. 0 == unlimited. First limit reached will apply.
   */
   subSize: number,
   /**
    * How each subfolder will filled base on 'name' | 'name desc' | 'random'.
    */
   orderBy: OrderBy
}
export interface Info {
   totalFiles: number,
   totalFolders: number;
   mainFolderName: string
}
export interface Res {
   success: boolean;
   message: string;
}
interface FileProperties {
   name: string
   path?: string
   size: number
   index?: number
}


// const config: Config = {//hover to read docs
//    path: `C:\\Users\\Ahmed\\Desktop\\blah`,
//    subFiles: 4,
//    subSize: 1.5 * GB,  //! Ex:'2 GB' typed as '2 * GB'
//    orderBy: 'random',
// }


import * as fileSystem from 'fs'
const fs = fileSystem.promises;
/**
 * reject with error string message. or resolve with success status string
 * @param config 
 * @returns 
 */
export function process(config: Config): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         var info: Info = {
            totalFiles: 0,
            totalFolders: 0,
            mainFolderName: config.path.substring(config.path.lastIndexOf('\\') + 1)
         }

         var dir = await fs.opendir(config.path);

         for await (const f of dir) {
            if (f.isDirectory())
               return reject(`There is a directory: "📂${f.name}". There should be only files!`);
            info.totalFiles++;
         }
         if (info.totalFiles == 0 || info.totalFiles <= config.subFiles)
            return reject(`Total files found '${info.totalFiles}' ${info.totalFiles == 0 ? '' : '. But, you set max number of files ' + config.subFiles + ' for each subfolder!'}`)
         var filesNameArr = await fs.readdir(config.path);//array of files name

         if (config.orderBy == 'random')
            filesNameArr.sort(random)
         else if (config.orderBy == 'name')
            filesNameArr.sort(naturalSort);
         else if (config.orderBy == 'name desc')
            filesNameArr.sort(naturalSort).reverse();
         else return reject(`Invalid order by!`);
         var allFiles: FileProperties[] = await Promise.all(filesNameArr.map(async (f) => ({ name: f, size: (await fs.stat(config.path + '\\' + f)).size })))

         console.table(allFiles)
         var remainFiles = info.totalFiles;//remained files in main folder. at the end should be 0.
         var subFolderPath: string;
         var i = 0;

         while (remainFiles > 0) {
            subFolderPath = `${config.path}\\${info.mainFolderName} ${++info.totalFolders} of`;//we don't know how many folders will created so we leave after '...of' blank. Then will rename it.
            await fs.mkdir(subFolderPath);

            // i is num of all files, j is num of files in subfolder

            for (let j = 0; await isSubRemind(j, subFolderPath, remainFiles, config); i++, j++, remainFiles--) {
               await fs.rename(config.path + '\\' + allFiles[i].name, subFolderPath + '\\' + allFiles[i].name);
            }


         }

         //append in name of all subfolders the total num of subfolders after '...of'
         for (let j = 1; j <= info.totalFolders; j++)
            await fs.rename(`${config.path}\\${info.mainFolderName} ${j} of`, `${config.path}\\${info.mainFolderName} ${j} of ${info.totalFolders}`)

         return resolve(`In folder:${info.mainFolderName}. Found ${info.totalFiles} files. Created ${info.totalFolders} subfolders.`);
      } catch (e) {
         reject(e);
      }
   })
}



/**
 * @param  {number} filesInSub
 * @param  {string} subFolderPath
 * @param  {number} remainFiles
 * @returns {boolean} true if subfolder not filled or any config options have not violated. false otherwise.
 */
function isSubRemind(filesInSub: number, subFolderPath: string, remainFiles: number,config:Config): Promise<boolean> {
   return new Promise(async (resolve, reject) => {
      try {
         if (remainFiles <= 0) return resolve(false);

         if (config.subFiles != 0)
            if (filesInSub >= config.subFiles)
               return resolve(false);

         if (config.subSize != 0) {
            var subSize = await dirSize(subFolderPath);
            if (subSize >= config.subSize)
               return resolve(false);
         }
         return resolve(true);
      } catch (e) {
         reject(e);
      }
   })
}

/**
 * 
 * @param path path of the folder
 * @returns {Promise<number>} of total size of the folder.
 */
function dirSize(path: string): Promise<number> {
   return new Promise(async (resolve, reject) => {
      try {
         const dir = await fs.readdir(path);
         var size = 0;
         for (let i = 0; i < dir.length; i++)
            size += (await fs.stat(path + '\\' + dir[i])).size;
         return resolve(size)
      } catch (e) {
         throw new Error('Throws from dirSize() function' + e)
      }
   })
}


/**
 * used as parameter on build-in sort function for arrays.
 * sort files name as string is not perfect because of how string handle numbers
 */

function naturalSort(a: any, b: any) {
   var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
   return collator.compare(a, b)
}

/**
 * used as parameter on build-in sort function for arrays.
 * cryptographically random :)
 */
function random(a: any, b: any) {
   let r = randomBytes(1).readInt8()
   return r > 0 ? 1 : (r < 0 ? -1 : 0);
}