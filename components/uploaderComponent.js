import React, { useEffect, useState } from 'react'
import { UploadDropzone } from 'react-uploader';
import { Uploader } from "uploader";
import AppContext from './AppContext';
import { useContext } from 'react';

const uploader = Uploader({
    apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
        ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
        : "free",
});
function CustomButton({ onClick }) {
    return (
        <button onClick={onClick}>
            Upload New Image
        </button>
    );
}

function UploaderComponent({ setRestoredPhoto, setMotionBlurImage }) {
    const context = useContext(AppContext);
    const uploaderOptions = {
        maxFileCount: 1,
        mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        editor: {
            images:
                { crop: false }
        },
        metadata: {
            "myCustomField1": true,
            "myCustomField2": {
                "hello": "world"
            },
        },
        styles: {
            colors: {
                'active': '#000',
                "error": "red",
                "primary": "#000",
                "shade100": "#000",
                "shade200": "#fff",
                "shade300": "#000",
                "shade400": "#000", // drag and drop text
                "shade500": "#fff",
                "shade600": "transparent",
                "shade700": "#fff",
                "shade800": "#fff",
                "shade900": "#fff" //upload an image text 
            },
            // width: '1000px'
        },
        tags: [
            "example_tag"
          ],
        showFinishButton: false,
        dropzoneRenderer: ({ open }) => (
            <CustomButton onClick={open} />
        ),

    }

    return (
        <div style={{padding:'0'}}>
            <UploadDropzone
                uploader={uploader}
                options={uploaderOptions}
                onUpdate={files => {
                    console.log(files)
                    context.setFileUrl(files.map(x => x.fileUrl).join("\n"))
                }}
                onComplete={files => alert(files.map(x => x.fileUrl).join("\n"))

                }
                height="45vh"
                border="5px"
            />
            </div>
    )
}

export default UploaderComponent