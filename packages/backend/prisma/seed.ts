import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.job.createMany({
    data: [
      {
        jobTitle: "Senior React Developer",
        company: "TechCorp",
        location: "Remote",
        salary: "$80,000 - $120,000",
        tags: "React, TypeScript, Node.js",
        applyLink: "https://example.com/job/1",
        source: "RemoteOK",
      },
      {
        jobTitle: "Backend Engineer (Python)",
        company: "DataFlow",
        location: "Madrid",
        salary: "45,000 - 60,000 EUR",
        tags: "Python, FastAPI, PostgreSQL",
        applyLink: "https://example.com/job/2",
        source: "InfoJobs",
      },
      {
        jobTitle: "Full Stack Developer",
        company: "StartupX",
        location: "Barcelona",
        salary: "N/A",
        tags: "JavaScript, React, Node.js, MongoDB",
        applyLink: "https://example.com/job/3",
        source: "Tecnoempleo",
      },
      {
        jobTitle: "DevOps Engineer",
        company: "CloudBase",
        location: "Remote",
        salary: "$100,000 - $140,000",
        tags: "AWS, Docker, Kubernetes, Terraform",
        applyLink: "https://example.com/job/4",
        source: "LinkedIn",
      },
      {
        jobTitle: "Data Scientist",
        company: "AnalyticsPro",
        location: "Valencia",
        salary: "40,000 - 55,000 EUR",
        tags: "Python, ML, TensorFlow, SQL",
        applyLink: "https://example.com/job/5",
        source: "Indeed",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
