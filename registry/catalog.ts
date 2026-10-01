export const siteUrl = 'https://ui.usedir.com/'
export const projectName = 'dir/ui'
export const registryRepository = 'lr-run/dir-ui'
export const releaseVersion = '0.1.8'
export const registryAddress = (item: string) => `${registryRepository}/${item}#v${releaseVersion}`
export const registryUrl = (_item: string) =>
  `https://github.com/${registryRepository}/blob/v${releaseVersion}/registry.json`
export const installCommand = (item: string) => `npx shadcn@4.21.0 add ${registryAddress(item)}`
