import { useForm } from "react-hook-form";
import Layout from "../components/layout";
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import useSWR from "swr";
import Custom500 from "./500";
import Head from "next/head";

dayjs.extend(utc);

interface FormInputs {
  Title: string;
  Text: string;
  ExpiresAt: string;
  Language: string;
}

interface ErrorMsg {
  Msg: string;
}

const SERVER_URL = process.env.SERVER_URL as string;

// Error message
const ErrorMsg = ({ Msg }: ErrorMsg) => {
  return (
    <>
      <span className="text-black bg-yellow-600 error-color rounded-xl p-5 mb-3 mt-3">
        {Msg}
      </span>
    </>
  );
};

const IndexPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();
  const { data: result, error } = useSWR(`${SERVER_URL}/langs`);
  const [language, setLanguage] = React.useState("none");
  const [formSubmitError, setFormSubmitError] = React.useState(false);
  let parsedLanguageData;

  if (error) {
    return (
      <>
        <div>
          <Custom500 />
        </div>
      </>
    );
  } else if (!result) {
    return (
      <>
        <Layout>
          <Head>
            <title>Home</title>
          </Head>
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "auto", background: "none" }}
            width="100"
            height="200"
            display="block"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#e15b64"
              strokeDasharray="164.93361431346415 56.97787143782138"
              strokeWidth="10"
            >
              <animateTransform
                attributeName="transform"
                dur="1s"
                keyTimes="0;1"
                repeatCount="indefinite"
                type="rotate"
                values="0 50 50;360 50 50"
              ></animateTransform>
            </circle>
          </svg>
        </Layout>
      </>
    );
  } else if (result) {
    parsedLanguageData = JSON.parse(JSON.stringify(result));
    console.log(parsedLanguageData.data);
  } else {
    return (
      <>
        <div>
          <Custom500 />
        </div>
      </>
    );
  }

  const onSubmit = (data: FormInputs) => {
    console.log(data);
    data.Language = language;
    const fetchFn = async (expiry: null | string) => {
      let MainHeaders = new Headers();
      MainHeaders.append("Content-Type", "application/json");

      const reqData = JSON.stringify({
        title: data.Title || "Untitled",
        text: data.Text,
        language: data.Language,
        expires_at: expiry,
      });

      fetch(`${SERVER_URL}/p-create`, {
        method: "POST",
        headers: MainHeaders,
        body: reqData,
        redirect: "follow",
      })
        .then((res) => {
          if (res.ok) {
            return res.text();
          } else {
            setFormSubmitError(true);
            throw new Error("Form Submit Error");
          }
        })
        .then((res) => {
          if (typeof window !== "undefined") {
            window.location.href = `/p/${res}`;
          }
        })
        .catch((error) => {
          console.log("error", error);
          setFormSubmitError(true);
        });
    };

    if (data.ExpiresAt === "never") {
      fetchFn(null);
    } else {
      fetchFn(data.ExpiresAt);
    }

    reset();
  };

  return (
    <>
      <Layout>
        <h1 className="text-3xl text-bold text-blue-200 pb-5">
          Create a New Paste
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col flex-wrap pb-10">
            {errors.Text && <ErrorMsg Msg="Body Required" />}
            {formSubmitError && <ErrorMsg Msg="Error Submitting Form" />}
            <div className="flex flex-wrap space-x-1 lg:space-x-4 xl:space-x-4 xl:flex-nowrap md:space-x-2">
              {/* Paste Title */}
              <div>
                <div className="text-bold mt-5 mb-5 text-2xl">
                  Paste Title <span className="text-sm">(max 255 chars)</span>
                </div>
                <input
                  {...register("Title")}
                  id="title"
                  placeholder="Untitled"
                  className="text-white p-3 text-md bg-gray-600 w-60 rounded-md xl:input-width"
                  style={{}}
                ></input>
              </div>

              {/* Paste Language */}
              <div>
                <div className="text-bold mt-5 mb-5 text-2xl">
                  Paste Language
                </div>
                <select
                  name="languages"
                  id="languages"
                  value={language}
                  onChange={(e: {
                    target: { value: React.SetStateAction<string> };
                  }) => {
                    setLanguage(e.target.value);
                    console.log(language);
                  }}
                  className="text-white p-3 w-60 bg-gray-600 rounded-md"
                >
                  {parsedLanguageData.map((data: any) => (
                    <option key={data.Language} value={data.Language}>
                      {data.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paste Expiry */}
              <div>
                <div className="text-bold mt-5 mb-5 text-2xl">Expires At</div>
                <select
                  {...register("ExpiresAt")}
                  name="expiresat"
                  id="expiresat"
                  className="text-white w-60 bg-green-800 p-3 mb-5 rounded-md"
                >
                  <option value="never">Never</option>
                  <option
                    value={dayjs.utc().local().add(10, "minute").format()}
                  >
                    10 minutes
                  </option>
                  <option value={dayjs.utc().local().add(1, "hour").format()}>
                    1 hr
                  </option>
                  <option value={dayjs.utc().local().add(1, "day").format()}>
                    1 day
                  </option>
                  <option value={dayjs.utc().local().add(1, "month").format()}>
                    1 month
                  </option>
                  <option value={dayjs.utc().local().add(6, "month").format()}>
                    6 months
                  </option>
                  <option value={dayjs.utc().local().add(1, "year").format()}>
                    1 year
                  </option>
                </select>
              </div>
            </div>

            {/* Paste Body */}
            <div>
              <div className="flex space-x-5 text-bold mt-5 mb-5 text-2xl flex-wrap">
                Paste Body
              </div>
              <pre>
                <textarea
                  {...register("Text", { required: true })}
                  spellCheck="false"
                  placeholder="Place text here ..."
                  className="text-white textarea-c w-full textarea-h text-md p-10 rounded-xl"
                ></textarea>
              </pre>
              <style jsx>{`
                .textarea-c {
                  background-color: #2d2d2d;
                }
                .textarea-h {
                  height: 70vh;
                }
              `}</style>
            </div>
            <input
              type="submit"
              className="text-white w-full p-5 mt-10 bg-blue-700 rounded-md"
            ></input>
          </div>
        </form>
      </Layout>
    </>
  );
};

export default IndexPage;
