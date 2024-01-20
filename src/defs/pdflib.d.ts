import pdf from 'pdf-lib'

declare global {
    const PDFLib: typeof pdf;
}
