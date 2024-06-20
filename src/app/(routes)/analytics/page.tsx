import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React from "react";
import Analytics from "@/components/Analytics/Analytics";

function page({ params }: { params: { daoDelegates: string } }) {
  return (
    <div>
      <Analytics />
    </div>
  );
}

export default page;
