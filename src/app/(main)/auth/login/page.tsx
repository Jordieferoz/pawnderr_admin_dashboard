import { APP_CONFIG } from "@/config/app-config";
import { LoginForm } from "@/ui_components/auth";

export default function LoginPage() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Login to your account</h1>
        </div>
        <div className="space-y-4">
          <LoginForm />
          {/* <div className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link prefetch={false} className="text-foreground" href="register">
              Register
            </Link>
          </div> */}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 flex w-full justify-center px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
