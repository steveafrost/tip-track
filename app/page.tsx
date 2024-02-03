import { SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col space-y-4 items-center justify-center h-full">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "green",
            colorBackground: "darkgreen",
            colorText: "white",
            colorInputBackground: "gray",
          },
          elements: {
            main: {
              background: "bg-primary",
            },
            button: {
              backgroundColor: "bg-white",
              borderRadius: "rounded-md",
              boxShadow: "shadow-lg",
            },

            rootBox: {
              maxWidth: "max-w-sm",
              background: "bg-primary",
              borderRadius: "rounded-md",
              boxShadow: "shadow-lg",
            },
            card: {
              background: "bg-primary",
              borderRadius: "rounded-md",
              boxShadow: "shadow-lg",
            },
          },
        }}
      />
    </div>
  );
}
