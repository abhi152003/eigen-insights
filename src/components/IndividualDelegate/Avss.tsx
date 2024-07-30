import { useRouter } from "next-nprogress-bar";
import React, { useState, useEffect } from "react";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { ThreeCircles } from "react-loader-spinner";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";

const GET_OPERATOR_AVSS = gql`
  query GetOperatorAvss($operatorId: String!) {
    operator(id: $operatorId) {
      id
      avsStatuses(where: { status: 1 }) {
        avs {
          id
          metadataURI
          registrationsCount
        }
        status
      }
    }
  }
`;

interface Type {
  individualDelegate: string;
}

interface Metadata {
  name: string;
  website: string;
  // description: string;
  logo: string;
  twitter: string;
}

function Avss({ props }: { props: Type }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [avssWithMetadata, setAvssWithMetadata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    loading: graphLoading,
    error,
    data,
  } = useQuery(GET_OPERATOR_AVSS, {
    variables: { operatorId: props.individualDelegate },
    context: {
      subgraph: "avs",
    },
  });

  const fetchMetadata = async (uri: string): Promise<Metadata | null> => {
    try {
      const url = `/api/get-avs-metadata?url=${encodeURIComponent(uri)}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch metadata: ${response.status} ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching metadata from ${uri}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (data && data.operator) {
      const fetchAllMetadata = async () => {
        setLoading(true);
        const avssWithMetadata = await Promise.all(
          data.operator.avsStatuses.map(async (status: any) => {
            const avs = status.avs;
            const metadata = await fetchMetadata(avs.metadataURI);
            return { ...avs, metadata };
          })
        );

        const sortedAvssWithMetadata = avssWithMetadata.sort(
          (a, b) =>
            parseInt(b.registrationsCount) - parseInt(a.registrationsCount)
        );

        setAvssWithMetadata(sortedAvssWithMetadata);
        setAvssWithMetadata(avssWithMetadata);
        setLoading(false);
      };
      fetchAllMetadata();
    }
  }, [data]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredAvss = avssWithMetadata.filter(
    (avs) =>
      avs.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avs.metadata?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <ThreeCircles
          visible={true}
          height="50"
          width="50"
          color="#FFFFFF"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );

  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <div>
      <div>
        <h1 className="mt-10 ml-3 font-medium text-3xl">AVSs</h1>
        <div className="searchBox searchShineWidthOfAVSs -mb-7 mt-5">
          <input
            className="searchInput"
            type="text"
            name=""
            placeholder="Search by Address or Name"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button className="searchButton">
            <IoSearchSharp className="iconExplore" />
          </button>
        </div>
        <div className="py-8 pe-14 font-poppins">
          {filteredAvss.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full bg-midnight-blue">
                <thead>
                  <tr className="bg-sky-blue bg-opacity-10">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Operators</th>
                    {/* <th className="px-4 py-2 text-left">Description</th> */}
                    <th className="px-4 py-2 text-left">Website</th>
                    <th className="px-4 py-2 text-left">Twitter</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvss.map((avs, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150"
                      onClick={() => router.push(`/avss/${avs.id}?active=info`)}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 flex-shrink-0 mr-3">
                            <Image
                              src={avs.metadata?.logo ?? "/placeholder.png"}
                              alt="Logo"
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full"
                            />
                          </div>
                          <span className="font-semibold">
                            {avs.metadata?.name ||
                              `${avs.id.slice(0, 6)}...${avs.id.slice(-4)}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <span>{`${avs.id.slice(0, 6)}...${avs.id.slice(
                            -4
                          )}`}</span>
                          <span
                            className="ml-2 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopy(avs.id);
                            }}
                            title="Copy address"
                          >
                            <IoCopy size={16} />
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{avs.registrationsCount}</td>
                      {/* <td className="px-4 py-2">
                        <p
                          className="truncate max-w-xs"
                          title={avs.metadata?.description}
                        >
                          {avs.metadata?.description || "N/A"}
                        </p>
                      </td> */}
                      <td className="px-4 py-2">
                        {avs.metadata?.website ? (
                          <a
                            href={avs.metadata.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Website
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {avs.metadata?.twitter ? (
                          <a
                            href={avs.metadata.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Twitter
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center pt-10">
              <div className="text-5xl">☹️</div>
              <div className="pt-4 font-semibold text-lg">
                No results found.
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default Avss;
