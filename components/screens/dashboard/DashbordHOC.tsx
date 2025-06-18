import dynamic from "next/dynamic";



const Dashboard = dynamic(() => import("../dashboard/Dashboard"), {
	ssr: true,
});

const DashbordHOC = () => {
	return <Dashboard />;
};

export default DashbordHOC;
