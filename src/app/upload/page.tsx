"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, useRef, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collapasMenu } from "@/lib/utils";

const FileUploader = () => {
    return (
        <Suspense fallback={<>Loading...</>}>
            <FileUploaderInternal />
        </Suspense>
    )
}
const FileUploaderInternal = () => {
  const inputFileRef = useRef(null);
  const [files, setFiles] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || process.env.ENDPOINT;

  useEffect(() => {
    collapasMenu();
  }, []);

  

  const handleSubmit = async (event) => {
    const databaseName = searchParams.get("databaseName");
    if (!databaseName) {
      console.error("No database name provided in the URL parameters.");
      return;
    }

    const promises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data_source_name", databaseName);
      const fullUrl = endpoint + "upload/file_upload/";
      const response = toast.promise(
        fetch(fullUrl, {
          method: "POST",
          body: formData,
        }),
        {
          pending: `Uploading ${file.name}`,
          success: `${file.name} upload successful!`,
          error: `${file.name} upload failed.`,
        },
        {
          theme: "colored",
          closeOnClick: true,
        }
      );
      return response;
    });

    try {
      await Promise.all(promises);
      toast.success("All files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
    }

    router.push("/database");
  };



  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const fileListArray = Array.from(fileList);
      setFiles((prevFiles) => [...prevFiles, ...fileListArray]);
      console.log(files);
    }
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop();
  };

  const handleExtension = (fileName: string) => {
    if (getFileExtension(fileName) === "pdf") {
      return <span className="px-2 text-md text-white bg-[#FF4646]">.PDF</span>;
    } else if (getFileExtension(fileName) === "docx") {
      return (
        <span className="px-2 text-md text-white bg-[#3C57B5]">.DOCX</span>
      );
    } else if (getFileExtension(fileName) === "txt") {
      return <span className="px-2 text-md text-white bg-[#AEAEAE]">.TXT</span>;
    }
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString();
  };

  return (
    <div className="h-5/6 bg-contain bg-center">
      <ToastContainer />
      <span className="flex gap-2 mb-6 cursor-pointer">
        <Link
          href="/database"
          className="flex items-center gap-2 text-gray-500 text-lg hover:text-gray-800 stroke-gray-500 hover:stroke-gray-800"
        >
          <svg
            width="13"
            height="11"
            viewBox="0 0 13 11"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5.5H1M1 5.5L5.125 1.375M1 5.5L5.125 9.625"
              stroke="inherit"
              strokeOpacity="0.5"
              strokeWidth="1.03125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Database
        </Link>
      </span>
      <span className="flex justify-between">
        <h3 className="font-bold">
          Upload files to{" "}
          <span className="text-[--primary] font-bold">
            {searchParams.get("databaseName")}
          </span>
        </h3>
      </span>
      <input
        accept=".pdf, .docx, .txt"
        type="file"
        multiple
        style={{ display: "none" }}
        ref={inputFileRef}
        onChange={handleFileInputChange}
      />
      {files.length <= 0 ? (
        <span
          className="bg-white border cursor-pointer rounded-lg w-full flex flex-col h-full items-center justify-between text-2xl bg-contain bg-auto bg-center bg-no-repeat"
          onClick={() => inputFileRef.current?.click()}
        >
          <span> </span>
          <span className="flex flex-col items-center">
            <span>
              <span className="text-[--primary] font-bold">
                Upload your files &nbsp;
              </span>
              or Drag & Drop here
            </span>
            <span className="flex gap-4 mt-6">
              <span className="px-2 text-md text-white bg-[#FF4646]">.PDF</span>
              <span className="px-2 text-md text-white bg-[#3C57B5]">
                .DOCX
              </span>
              <span className="px-2 text-md text-white bg-[#AEAEAE]">.TXT</span>
            </span>
          </span>
          <span className="mb-6">
            <div
            className="h-200 w-200"
            />
          </span>
        </span> 
      ) : (
        <span className="bg-white flex flex-col gap-10 p-10 border rounded-lg w-full flex h-full ">
          <span className="flex flex-row gap-2 items-center self-start ">
            <Image
              src="/svg/upload.svg"
              height={26}
              width={26}
              alt="uploadIcon"
            />
            <h3
              className="text-[--primary] cursor-pointer"
              onClick={() => inputFileRef.current?.click()}
            >
              Click here to upload more files
            </h3>
            <span className="flex gap-6">
              <span className="px-2 text-md text-white bg-[#FF4646]">.PDF</span>
              <span className="px-2 text-md text-white bg-[#3C57B5]">
                .DOCX
              </span>
              <span className="px-2 text-md text-white bg-[#AEAEAE]">.TXT</span>
            </span>
          </span>
          <span className="flex flex-col gap-4 h-3/4 overflow-auto">
            <>
              {files.map((file) => {
                return (
                  <span className="p-6 bg-[#F7F7F7] rounded-lg flex justify-between">
                    <span className="w-1/6">
                      <>{handleExtension(file.name)}</>
                    </span>
                    <span className="w-2/6">
                      <h4>{file.name}</h4>
                    </span>
                    <span className="w-1/6">
                      <h4>{file.size}</h4>
                    </span>
                    <span className="w-1/6 flex gap-3 items-center">
                      <Image
                        src="/svg/profile.svg"
                        height={16}
                        width={16}
                        alt="profile"
                      />
                      <h4>Admin</h4>
                    </span>
                    <span className="w-1/6">
                      <h4>{getCurrentDate()}</h4>
                    </span>
                  </span>
                );
              })}
            </>
          </span>
          <button
            className="bg-[--primary] text-white py-4 rounded-xl"
            onClick={handleSubmit}
          >
            Submit Files
          </button>
        </span>
      )}
    </div>
  );
};

export default FileUploader;
