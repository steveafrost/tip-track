export default function Home() {
  return (
    <div className="flex flex-col space-y-4 items-start justify-start ">
      <div className="bg-slate-50 p-4 rounded-md space-y-2">
        <h3 className="text-xl font-bold">Track Orders</h3>
        <p>
          As orders are accepted, add the order to the app to keep track of the
          order as well as the location. If a location has multiple orders, all
          will be listed on the lookup page.
        </p>
      </div>
      <div className="bg-slate-50 p-4 rounded-md space-y-2">
        <h3 className="text-xl font-bold">Record Tips</h3>
        <p>
          Keep track of your earnings accurately with our built-in tip
          recording. Enter your tips after every shift to provide a
          comprehensive summary of your daily, weekly, or monthly earnings.
        </p>
      </div>
      <div className="bg-slate-50 p-4 rounded-md space-y-2">
        <h3 className="text-xl font-bold">View Average Tips</h3>
        <p>
          Using the lookup page, you can view the average tips for a specific
          location.
        </p>
      </div>
    </div>
  );
}
