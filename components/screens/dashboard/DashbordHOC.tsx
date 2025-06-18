import dynamic from "next/dynamic";

type Props = {};

const Dashboard = dynamic(() => import("../dashboard/Dashboard"), {
	ssr: true,
});

const DashbordHOC = (props: Props) => {
	return <Dashboard {...props} />;
};

export default DashbordHOC;
